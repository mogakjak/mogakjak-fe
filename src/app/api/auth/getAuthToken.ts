"use server";

import { cookies } from "next/headers";

export async function getAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("mg_access_token")?.value;
    return token || null;
  } catch {
    return null;
  }
}
