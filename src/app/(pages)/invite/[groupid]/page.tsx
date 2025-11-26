import InvitePageClient from "./InvitePageClient";
import { Metadata } from "next";
import type { GroupMeta } from "@/app/_types/groups";

type InvitePageProps = {
  params: Promise<{ groupid: string }>;
};

const DEFAULT_METADATA = {
  title: "몰입이 쉬워지는 곳, 모각작에 초대해요 💌",
  description: "타이머로 함께 몰입하며 꾸준함을 만드는 모각작 커뮤니티",
  imageUrl: "https://mogakjak-fe.vercel.app/thumbnailInvite.png",
};

const API_BASE = process.env.NEXT_PUBLIC_API_PROXY;

async function fetchGroupMeta(groupId: string): Promise<GroupMeta | null> {
  try {
    const res = await fetch(`${API_BASE}/api/groups/meta/${groupId}`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) return null;

    const json = (await res.json().catch(() => null)) as
      | { statusCode?: number; data?: unknown }
      | GroupMeta
      | null;

    if (!json || typeof json !== "object") return null;

    if ("statusCode" in json && typeof json.statusCode === "number") {
      const data = (json as { data?: unknown }).data as GroupMeta | undefined;
      return data ?? null;
    }

    return json as GroupMeta;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: InvitePageProps): Promise<Metadata> {
  const { groupid } = await params;

  let title = DEFAULT_METADATA.title;
  let description = DEFAULT_METADATA.description;
  let imageUrl = DEFAULT_METADATA.imageUrl;
  let groupName = "모각작";

  try {
    if (groupid) {
      const meta = await fetchGroupMeta(groupid);
      if (meta?.groupName) {
        groupName = meta.groupName;
        title = `"${groupName}" 그룹으로 초대해요 💌`;
        description =
          "타이머로 함께 몰입하며 꾸준함을 만드는 힘을 경험해 보세요!";
        imageUrl = DEFAULT_METADATA.imageUrl;
      }
    }
  } catch (error) {
    console.error("그룹 메타 정보 가져오기 실패:", error);
  }

  const url = `https://mogakjak-fe.vercel.app/invite/${groupid}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "모각작",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${groupName} 초대`,
        },
      ],
      locale: "ko_KR",
      type: "website",
    },
  };
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { groupid } = await params;

  let groupName = "모각작";
  try {
    if (groupid) {
      const meta = await fetchGroupMeta(groupid);
      console.log("meta", meta);
      if (meta?.groupName) {
        groupName = meta.groupName;
      }
    }
  } catch (error) {
    console.error("그룹 메타 정보 가져오기 실패 (페이지):", error);
  }

  return <InvitePageClient groupid={groupid} groupName={groupName} />;
}
