export type ApiResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
};

export type ProfileUpdate = {
  nickname: string;
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
