import { useQuery } from "@tanstack/react-query";
import { getFeedbackTags } from "../../api/feedback/api";
import { feedbackKeys } from "../../api/feedback/keys";
import { FeedbackTagType } from "../../_types/feedback";

export const useFeedbackTags = (type?: FeedbackTagType) => {
  return useQuery({
    queryKey: feedbackKeys.tags(type),
    queryFn: () => getFeedbackTags(type),
  });
};

