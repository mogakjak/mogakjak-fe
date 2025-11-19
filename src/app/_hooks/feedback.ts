import { useMutation, useQuery } from "@tanstack/react-query";
import { getFeedbackTags, postFeedback } from "../api/feedback/api";
import { feedbackKeys } from "../api/feedback/keys";
import { FeedbackSubmit, FeedbackTagType } from "../_types/feedback";

export const useFeedbackTags = (type?: FeedbackTagType) => {
  return useQuery({
    queryKey: feedbackKeys.tags(type),
    queryFn: () => getFeedbackTags(type),
  });
};

export const useCreateFeedback = () => {
  return useMutation({
    mutationFn: (payload: FeedbackSubmit) => postFeedback(payload),
  });
};
