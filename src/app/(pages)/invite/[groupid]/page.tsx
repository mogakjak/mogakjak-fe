import { getGroupDetailServer } from "@/app/api/groups/serverApi";
import InvitePageClient from "./InvitePageClient";
import { Metadata } from "next";

// 동적 라우트가 서버에서 실행되도록 명시
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

type InvitePageProps = {
  params: Promise<{ groupid: string }>;
};

const DEFAULT_METADATA = {
  title: "몰입이 쉬워지는 곳, 모각작에 초대해요 💌",
  description: "함께 몰입하며 꾸준함을 만드는 모각작 커뮤니티",
  imageUrl: "https://mogakjak-fe.vercel.app/thumbnailInvite.png",
};

export async function generateMetadata({
  params,
}: InvitePageProps): Promise<Metadata> {
  const { groupid } = await params;

  let title = DEFAULT_METADATA.title;
  let description = DEFAULT_METADATA.description;
  let imageUrl = DEFAULT_METADATA.imageUrl;
  let groupName = "모각작";
  let inviterName = "모각작 멤버";

  try {
    const groupData = await getGroupDetailServer(groupid);
    if (groupData) {
      const inviter = groupData.members?.[0];
      inviterName = inviter?.nickname || "모각작 멤버";
      groupName = groupData.name || "모각작";
      title = `${inviterName}님이 "${groupName}"으로 초대했어요!`;
      description =
        "타이머로 함께 몰입하며 꾸준함을 만드는 힘을 경험해 보세요!";
      // 초대 페이지 : thumbnailInvite.png
      imageUrl = DEFAULT_METADATA.imageUrl;
    }
  } catch (error) {
    // 에러가 발생해도 기본 메타데이터 사용
    console.error("그룹 정보 가져오기 실패:", error);
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
  return <InvitePageClient groupid={groupid} />;
}
