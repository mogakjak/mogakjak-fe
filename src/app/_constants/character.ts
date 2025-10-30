import { CharacterLevelInfo } from "../_types/characterLevel";

export const CHARACTER_BY_HOURS: Record<number, CharacterLevelInfo> = {
  1: {
    level: 1,
    name: "새싹뽀모",
    hours: 1,
    description: "집중력을 끌어올리는 ‘뽀인트, 뽀모입니다!’",
  },
  3: {
    level: 2,
    name: "방울뽀모",
    hours: 3,
    description: "방울밤을 맺힌 집중의 시간!",
  },
  7: {
    level: 3,
    name: "부끄뽀모",
    hours: 7,
    description: "뽀모랑 같이 성장해줘서 고마워",
  },
  15: {
    level: 4,
    name: "토실뽀모",
    hours: 15,
    description: "토실해진 집중력만큼 뽀모도 토실해졌어!",
  },
  30: {
    level: 5,
    name: "새싹오렝",
    hours: 30,
    description: "시크한 오렝이의 성장을 부탁해.",
  },
  70: {
    level: 6,
    name: "방울오렝",
    hours: 70,
    description: "나 오렝이는 흔들리지 않는 시크함을 가졌지.",
  },
  120: {
    level: 7,
    name: "시크오렝",
    hours: 120,
    description: "이 구역의 집중왕은 나야! 집중을 ‘오렝’하지.",
  },
  185: {
    level: 8,
    name: "통통오렝",
    hours: 185,
    description: "덕분에 집중 시간이 ‘통통’하게 쌓여. 고마워.",
  },
  230: {
    level: 9,
    name: "새싹레몽",
    hours: 230,
    description: "레몽이 레벨 올리러 같이 가보자!",
  },
  270: {
    level: 10,
    name: "방울레몽",
    hours: 270,
    description: "방울이 친구와 함께하니 몰입이 더 쉽네!",
  },
  320: {
    level: 11,
    name: "상큼레몽",
    hours: 320,
    description: "레몽처럼 새콤하게 기록 갱신 해볼까?",
  },
  360: {
    level: 12,
    name: "포동레몽",
    hours: 360,
    description: "집중력을 무럭무럭 먹고 레몽이 포동해졌어!",
  },
} as const;
