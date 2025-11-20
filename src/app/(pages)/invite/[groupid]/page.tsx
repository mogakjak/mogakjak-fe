import type { Metadata } from "next";
import { getGroupDetail } from "@/app/api/groups/api";
import InvitePageClient from "./InvitePageClient";

type InvitePageProps = {
  params: Promise<{ groupid: string }>;
};

export async function generateMetadata({
  params,
}: InvitePageProps): Promise<Metadata> {
  const { groupid } = await params;

  try {
    const groupData = await getGroupDetail(groupid);

    const inviter = groupData.members?.[0];
    const inviterName = inviter?.nickname || "모각작 멤버";
    const groupName = groupData.name || "모각작";

    return {
      title: `${inviterName}님이 "${groupName}"으로 초대했어요!`,
      description: "타이머로 함께 몰입하며 꾸준함을 만드는 힘을 경험해 보세요!",
      openGraph: {
        title: `${inviterName}님이 "${groupName}"으로 초대했어요!`,
        description:
          "타이머로 함께 몰입하며 꾸준함을 만드는 힘을 경험해 보세요!",
        url: `https://mogakjak-fe.vercel.app/invite/${groupid}`,
        siteName: "모각작",
        images: [
          {
            url:
              groupData.imageUrl ||
              "https://mogakjak-fe.vercel.app/thumbnail.png",
            width: 1200,
            height: 630,
            alt: `${groupName} 초대`,
          },
        ],
        locale: "ko_KR",
        type: "website",
      },
    };
  } catch (error) {
    return {
      title: "모각작 초대",
      description: "함께 몰입하며 꾸준함을 만드는 모각작 커뮤니티",
      openGraph: {
        title: "모각작 초대",
        description:
          "타이머로 함께 몰입하며 꾸준함을 만드는 힘을 경험해 보세요!",
        url: `https://mogakjak-fe.vercel.app/invite/${groupid}`,
        siteName: "모각작",
        images: [
          {
            url: "https://mogakjak-fe.vercel.app/thumbnail.png",
            width: 1200,
            height: 630,
            alt: "모각작 초대",
          },
        ],
        locale: "ko_KR",
        type: "website",
      },
    };
  }
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { groupid } = await params;
  return <InvitePageClient groupid={groupid} />;
}
