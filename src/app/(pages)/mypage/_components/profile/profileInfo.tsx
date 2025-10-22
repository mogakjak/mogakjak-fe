interface ProfileInfoProps {
  title: string;
  content: string;
}

export default function ProfileInfo({ title, content }: ProfileInfoProps) {
  return (
    <div
      className={
        "px-5 py-[13px] rounded-lg text-body1-16SB border border-gray-200 bg-gray-100 flex justify-between"
      }
    >
      <p className="text-black">{title}</p>
      <p className="text-red-500">{content}</p>
    </div>
  );
}
