export type ApiResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
};

export type ProfileUpdate = {
  nickname?: string;
  email?: string;
  imageUrl?: string;
};

export type CharacterUpdate = {
  characterId: string;
};

export type CharacterGuideItem = {
  id: string;
  level: number;
  name: string;
  imageUrl: string;
  unlockTime: string;
};

export type CharacterCard = {
  characterId: string;
  name: string;
  imageUrl: string;
  level: number;
  unlockCondition: string;
};

export type CharacterBasket = {
  nickname: string;
  email: string;
  totalTaskCount: number;
  totalFocusTime: string;
  mainCharacter: CharacterCard;
  collectedCharacterCount: number;
  ownedCharacters: CharacterCard[];
  lockedCharacters: CharacterCard[];
};

// 프로필 관련 타입
export type Profile = {
  nickname: string;
  imageUrl: string;
  character: Character;
  quote: Quote;
};
export type Character = {
  id: string;
  level: number;
  name: string;
  mainCharacterImage: string;
  isActive: boolean;
  unlockTimeInSeconds: number;
};

export type Quote = {
  id: string;
  content: string;
  author: string;
};
