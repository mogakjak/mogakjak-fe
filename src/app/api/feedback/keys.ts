import { FeedbackTagType } from "@/app/_types/feedback";

export const feedbackKeys = {
  all: ["feedback"],
  tags: (type?: FeedbackTagType) => [...feedbackKeys.all, "tags", type],
};
