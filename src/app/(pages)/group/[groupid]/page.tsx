import GroupRoomPage from "../_components/groupRoomPage";

type GroupPageProps = {
  params: Promise<{ groupId: string }>;
};

export default async function Page({ params }: GroupPageProps) {
  const { groupId } = await params;

  return <GroupRoomPage groupId={groupId} />;
}
