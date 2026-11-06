interface ProfileInfoProps {
  title: string;
  content: string;
}

export default function ProfileInfo({ title, content }: ProfileInfoProps) {
  return (
    <div
      className={
        "h-12 px-5 items-center rounded-lg text-body1-16SB border border-gray-200 bg-gray-100 flex justify-between"
      }
    >
      <p className="text-gray-500">{title}</p>
      <p className="text-black">{content}</p>
    </div>
  );
}
