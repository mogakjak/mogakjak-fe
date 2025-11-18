export type FeedbackTagType = "POSITIVE" | "NEGATIVE" | "NEUTRAL";

export interface FeedbackTag {
  code: string;
  displayName: string;
  type: FeedbackTagType;
}
