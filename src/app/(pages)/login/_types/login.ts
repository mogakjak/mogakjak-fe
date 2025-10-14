export type LoginProvider = "google" | "kakao";

export interface LoginButtonProps {
  type: LoginProvider;
  onClick?: () => void;
}
