import GroupRoomPage from "../_components/groupRoomPage";

type GroupPageProps = {
  params: Promise<{ groupid: string }>;
};

export default async function Page({ params }: GroupPageProps) {
  const { groupid } = await params;

  return <GroupRoomPage groupid={groupid} />;
}
