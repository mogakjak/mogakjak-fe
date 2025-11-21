"use server";

import { cookies, headers } from "next/headers";
import type { GroupDetail } from "@/app/_types/groups";

/**
 * 서버 컴포넌트에서 사용하는 그룹 API 유틸리티
 */
async function getBaseUrl(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  return process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;
}

async function requestServer<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get("mg_access_token")?.value;
  const baseUrl = await getBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const headersObj: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    headersObj.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers: { ...headersObj, ...options.headers },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const json = (await res.json().catch(() => {
    throw new Error("Failed to parse JSON response");
  })) as
    | { statusCode?: number; message?: string; data?: unknown }
    | undefined;

  if (json && typeof json.statusCode === "number") {
    const code = json.statusCode;
    const isSuccess = code === 0 || (code >= 200 && code < 300);
    if (!isSuccess) {
      throw new Error(json?.message ?? `HTTP ${code}`);
    }
    return json?.data as T;
  }

  return json as T;
}

/**
 * 서버 컴포넌트에서 그룹 상세 정보를 가져옵니다.
 */
export async function getGroupDetailServer(
  groupId: string
): Promise<GroupDetail> {
  return requestServer<GroupDetail>(`/api/groups/${groupId}`, {
    method: "GET",
  });
}
