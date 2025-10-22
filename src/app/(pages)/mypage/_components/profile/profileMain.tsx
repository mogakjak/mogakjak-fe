import Image from "next/image";
import ProfileEditButton from "./profileEditButton";
import ProfileInfo from "./profileInfo";

export default function Profile() {
  return (
    <div className="w-[327px] p-6 rounded-[20px] bg-white">
      <div className="flex justify-between items-center mb-7">
        <h2 className="text-heading4-20SB text-black">내 프로필</h2>
        <button className="text-body2-14R text-gray-500 underline">
          로그아웃
        </button>
      </div>
      <section className="flex flex-col items-center mb-[52px]">
        <Image
          src="/profileDefault.svg"
          alt="프로필 기본"
          width={160}
          height={160}
        />
        <div className="flex flex-col gap-1 text-center mt-5 mb-6">
          <p className="text-heading3-24SB text-black">김이름</p>
          <p className="text-body1-16R text-gray-500">email@gmail.com</p>
        </div>
        <ProfileEditButton />
      </section>

      <section className="flex flex-col gap-3">
        <ProfileInfo title="완료한 작업" content="35개" />
        <ProfileInfo title="완료한 시간" content="3시간" />
        <ProfileInfo title="수집 캐릭터" content="6개" />
      </section>
    </div>
  );
}
