import Image from "next/image";

const features = [
  {
    title: "한눈에,",
    description: "친구들의 몰입 현황을 넓은 화면으로 보며 동기부여를 얻으세요",
  },
  {
    title: "체계적으로,",
    description: "오늘의 할 일을 더 빠르고 직관적으로 관리할 수 있습니다.",
  },
  {
    title: "더 깊게,",
    description:
      "상세 통계로 성장 과정을 돌아보고, 다음 단계로 나아갈 수 있어요.",
  },
];

interface MobileHomePageProps {
  groupName?: string;
}

export default function MobileHomePage({
  groupName = "모각작",
}: MobileHomePageProps) {
  return (
    <main className="w-full py-7 min-h-screen flex flex-col items-center justify-evenly">
      <Image
        src={"/logo.svg"}
        alt="모각작 로고"
        width={100}
        height={67}
      ></Image>

      <h2 className="text-lg font-semibold pt-5 text-center">
        PC에서 초대를 수락하고 <br /> 최고의 몰입을 경험해 보세요!
      </h2>
      <Image
        src={"/Icons/desktop.svg"}
        alt="데스크톱"
        width={150}
        height={150}
      ></Image>

      <div className="flex flex-col items-center w-full py-5 mb-5 bg-red-50 border border-red-100 rounded-3xl">
        <p className="text-lg font-semibold text-red-500">{groupName}</p>
      </div>

      <div className="flex flex-col gap-4">
        {features.map(({ title, description }) => (
          <div key={title} className="flex items-start gap-1.5">
            <Image
              src="/Icons/check.svg"
              alt="체크 아이콘"
              width={20}
              height={20}
              priority
            />
            <div>
              <p className="text-[12px] text-gray-800">{title}</p>
              <p className="text-[10px] text-gray-600">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
