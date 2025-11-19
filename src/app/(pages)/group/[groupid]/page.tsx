import GroupRoomPage from "../_components/groupRoomPage";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ groupId: string | string[] }>;
};

export default async function Page({ params }: PageProps) {
  try {
    const resolvedParams = await params;

    if (!resolvedParams || !resolvedParams.groupId) {
      notFound();
    }

    const groupId = Array.isArray(resolvedParams.groupId)
      ? resolvedParams.groupId[0]
      : resolvedParams.groupId;

    if (!groupId || groupId === "undefined" || typeof groupId !== "string") {
      notFound();
    }

    return <GroupRoomPage groupId={groupId} />;
  } catch (error) {
    console.error("Error parsing params:", error);
    notFound();
  }
}
