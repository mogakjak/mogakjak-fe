import { CharacterLevelInfo } from "../_types/characterLevel";

export const CHARACTER_BY_HOURS: Record<number, CharacterLevelInfo> = {
  1: {
    level: 1,
    name: "새싹뽀모",
    hours: 1,
    description: "새싹뽀모와 함께 집중 성장을 \n 시작해 봅시다!",
  },
  5: {
    level: 2,
    name: "방울뽀모",
    hours: 5,
    description: "첫 성과를 달성했어요!\n 몰입의 시작을 축하합니다!",
  },
  10: {
    level: 3,
    name: "부끄뽀모",
    hours: 10,
    description: "집중 근육이 생겼어요!\n 앞으로의 큰 무기가 될 거예요",
  },
  20: {
    level: 4,
    name: "토실뽀모",
    hours: 20,
    description:
      "벌써 집중 습관이 형성된 것 같아요!\n 이 흐름을 이어가 봅시다!",
  },
  50: {
    level: 5,
    name: "새싹오렝",
    hours: 50,
    description: "다음 성장 단계로 폴짝!\n 꾸준함 덕분에 오렝이를 얻었어요.",
  },
  100: {
    level: 6,
    name: "방울오렝",
    hours: 100,
    description: "지속적인 노력 덕분에\n 누적 시간이 폭발적으로 늘었어요!",
  },
  150: {
    level: 7,
    name: "시크오렝",
    hours: 150,
    description: "축적된 몰입 시간이\n 성장을 이끌 거예요.",
  },
  200: {
    level: 8,
    name: "통통오렝",
    hours: 200,
    description: "탄탄한 성과 완성!\n 이제 집중이 익숙해졌어요.",
  },
  250: {
    level: 9,
    name: "새싹레몽",
    hours: 250,
    description: "집중력 향상 확인!\n 레몽이와 함께 계속 나아가세요!",
  },
  300: {
    level: 10,
    name: "방울레몽",
    hours: 300,
    description: "꾸준한 몰입의 축적이\n 빛을 발하고 있어요!",
  },
  350: {
    level: 11,
    name: "상큼레몽",
    hours: 350,
    description: "그동안의 시간들이\n 확실한 실력으로 굳어졌어요.",
  },
  400: {
    level: 12,
    name: "포동레몽",
    hours: 400,
    description: "축하합니다!\n 몰입의 마스터가 되었어요!",
  },
} as const;
