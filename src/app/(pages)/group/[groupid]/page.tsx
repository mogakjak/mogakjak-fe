import GroupRoomPage from "../_components/groupRoomPage";

export default function Page({ params }: { params: { groupId: string } }) {
  return <GroupRoomPage groupId={params.groupId} />;
}
