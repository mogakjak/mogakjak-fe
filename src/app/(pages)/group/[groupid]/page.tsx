import GroupRoomPage from "../_components/groupRoomPage";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ groupId: string | string[] }>;
};

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export default async function Page({ params }: PageProps) {
  try {
    const resolvedParams = await params;

    // 디버깅을 위한 로그 (프로덕션에서도 확인 가능)
    if (process.env.NODE_ENV === "production") {
      console.log(
        "[GroupPage] Resolved params:",
        JSON.stringify(resolvedParams)
      );
    }

    if (!resolvedParams || !resolvedParams.groupId) {
      console.error("[GroupPage] No groupId in params:", resolvedParams);
      notFound();
    }

    const groupId = Array.isArray(resolvedParams.groupId)
      ? resolvedParams.groupId[0]
      : resolvedParams.groupId;

    if (!groupId || groupId === "undefined" || typeof groupId !== "string") {
      console.error("[GroupPage] Invalid groupId:", groupId);
      notFound();
    }

    if (process.env.NODE_ENV === "production") {
      console.log("[GroupPage] Final groupId:", groupId);
    }

    return <GroupRoomPage groupId={groupId} />;
  } catch (error) {
    console.error("[GroupPage] Error parsing params:", error);
    notFound();
  }
}
