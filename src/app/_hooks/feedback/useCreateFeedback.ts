import { useMutation } from "@tanstack/react-query";
import { postFeedback } from "../../api/feedback/api";
import { FeedbackSubmit } from "../../_types/feedback";

export const useCreateFeedback = () => {
  return useMutation({
    mutationFn: (payload: FeedbackSubmit) => postFeedback(payload),
  });
};

