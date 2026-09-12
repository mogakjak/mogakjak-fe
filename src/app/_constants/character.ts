import { CharacterLevelInfo } from "../_types/characterLevel";

/** CR01/CR02: 출석 일수 + 집중 시간 모두 충족 시 다음 레벨 */
export const CHARACTER_LEVELS: CharacterLevelInfo[] = [
  {
    level: 1,
    name: "새싹뽀모",
    hours: 0,
    attendanceDays: 0,
    description: "새싹뽀모와 함께 집중 성장을 \n 시작해 봅시다!",
  },
  {
    level: 2,
    name: "방울뽀모",
    hours: 20,
    attendanceDays: 15,
    description: "첫 성과를 달성했어요!\n 몰입의 시작을 축하합니다!",
  },
  {
    level: 3,
    name: "부끄뽀모",
    hours: 50,
    attendanceDays: 30,
    description: "집중 근육이 생겼어요!\n 앞으로의 큰 무기가 될 거예요",
  },
  {
    level: 4,
    name: "토실뽀모",
    hours: 90,
    attendanceDays: 50,
    description:
      "벌써 집중 습관이 형성된 것 같아요!\n 이 흐름을 이어가 봅시다!",
  },
  {
    level: 5,
    name: "튼튼뽀모",
    hours: 140,
    attendanceDays: 75,
    description: "다음 성장 단계로 폴짝!\n 꾸준함 덕분에 성장했어요.",
  },
  {
    level: 6,
    name: "반짝뽀모",
    hours: 200,
    attendanceDays: 105,
    description: "지속적인 노력 덕분에\n 누적 시간이 폭발적으로 늘었어요!",
  },
  {
    level: 7,
    name: "열정뽀모",
    hours: 280,
    attendanceDays: 140,
    description: "축적된 몰입 시간이\n 성장을 이끌 거예요.",
  },
  {
    level: 8,
    name: "듬직뽀모",
    hours: 380,
    attendanceDays: 180,
    description: "탄탄한 성과 완성!\n 이제 집중이 익숙해졌어요.",
  },
  {
    level: 9,
    name: "빛나뽀모",
    hours: 500,
    attendanceDays: 225,
    description: "집중력 향상 확인!\n 뽀모와 함께 계속 나아가세요!",
  },
  {
    level: 10,
    name: "든든뽀모",
    hours: 650,
    attendanceDays: 275,
    description: "꾸준한 몰입의 축적이\n 빛을 발하고 있어요!",
  },
  {
    level: 11,
    name: "고수뽀모",
    hours: 850,
    attendanceDays: 330,
    description: "그동안의 시간들이\n 확실한 실력으로 굳어졌어요.",
  },
  {
    level: 12,
    name: "마스터뽀모",
    hours: 1100,
    attendanceDays: 400,
    description: "축하합니다!\n 몰입의 마스터가 되었어요!",
  },
];

/** @deprecated CHARACTER_LEVELS 사용 */
export const CHARACTER_BY_HOURS: Record<number, CharacterLevelInfo> =
  Object.fromEntries(CHARACTER_LEVELS.map((c) => [c.hours || 1, c]));
