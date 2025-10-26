import ProfileActive from "@/app/(pages)/mypage/_components/board/mate/profileActive";

export default function GroupMembers() {
  const members = [
    { id: 1, name: "김이름1", isActive: true },
    { id: 2, name: "김이름2", isActive: false },
    { id: 3, name: "김이름3", isActive: false },
    { id: 4, name: "김이름4", isActive: true },
    { id: 5, name: "김이름5", isActive: true },
    { id: 6, name: "김이름6", isActive: true },
    { id: 7, name: "김이름7", isActive: true },
  ];

  return (
    <div className="grid grid-cols-2 gap-x-[40px] gap-y-[12px]">
      {members.map((member) => (
        <div key={member.id} className="flex items-center gap-3">
          <ProfileActive
            key={member.id}
            name={member.name}
            active={member.isActive}
          />
          <p className="text-body1-16SB text-gray-700">{member.name}</p>
        </div>
      ))}
    </div>
  );
}
