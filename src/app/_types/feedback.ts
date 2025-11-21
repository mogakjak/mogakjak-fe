export type FeedbackTagType = "POSITIVE" | "NEGATIVE" | "NEUTRAL";

export interface FeedbackTag {
  code: string;
  displayName: string;
  type: FeedbackTagType;
}

export interface FeedbackSubmit {
  sessionId?: string;
  score: number;
  tagCodes: string[];
  content: string;
}
