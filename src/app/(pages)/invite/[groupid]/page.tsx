import type { Metadata } from "next";
import { getGroupDetailServer } from "@/app/api/groups/serverApi";
import InvitePageClient from "./InvitePageClient";

type InvitePageProps = {
  params: Promise<{ groupid: string }>;
};

const DEFAULT_METADATA = {
  title: "모각작 초대",
  description: "함께 몰입하며 꾸준함을 만드는 모각작 커뮤니티",
  imageUrl: "https://mogakjak-fe.vercel.app/thumbnail.png",
};

function buildInviteMetadata(
  inviterName: string,
  groupName: string,
  groupid: string,
  imageUrl?: string
): Metadata {
  const title = `${inviterName}님이 "${groupName}"으로 초대했어요!`;
  const description =
    "타이머로 함께 몰입하며 꾸준함을 만드는 힘을 경험해 보세요!";
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
          url: imageUrl || DEFAULT_METADATA.imageUrl,
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

export async function generateMetadata({
  params,
}: InvitePageProps): Promise<Metadata> {
  const { groupid } = await params;

  try {
    const groupData = await getGroupDetailServer(groupid);
    const inviter = groupData.members?.[0];
    const inviterName = inviter?.nickname || "모각작 멤버";
    const groupName = groupData.name || "모각작";

    return buildInviteMetadata(
      inviterName,
      groupName,
      groupid,
      groupData.imageUrl
    );
  } catch (error) {
    console.error("그룹 정보 가져오기 실패:", error);
    return {
      title: DEFAULT_METADATA.title,
      description: DEFAULT_METADATA.description,
      openGraph: {
        title: DEFAULT_METADATA.title,
        description: DEFAULT_METADATA.description,
        url: `https://mogakjak-fe.vercel.app/invite/${groupid}`,
        siteName: "모각작",
        images: [
          {
            url: DEFAULT_METADATA.imageUrl,
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
