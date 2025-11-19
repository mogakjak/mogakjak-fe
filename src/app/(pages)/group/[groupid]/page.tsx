import GroupRoomPage from "../_components/groupRoomPage";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ groupId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { groupId } = await params;

  // groupId가 없거나 유효하지 않으면 404
  if (!groupId || groupId === "undefined") {
    notFound();
  }

  return <GroupRoomPage groupId={groupId} />;
}
