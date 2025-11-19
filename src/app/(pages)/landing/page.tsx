import KakaoShareButton from "@/app/_components/common/kakaoShareButton";

export default function Landing() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <div className="mt-20 w-full max-w-[360px] px-6">
        <KakaoShareButton />
      </div>
    </div>
  );
}

