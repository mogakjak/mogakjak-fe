import type {
  FeedbackSubmit,
  FeedbackTag,
  FeedbackTagType,
} from "../../_types/feedback";
import { request } from "../request";

const FEEDBACK_BASE = "/api/feedback";

export const getFeedbackTags = (type?: FeedbackTagType) => {
  const query = type ? `?type=${type}` : "";
  return request<FeedbackTag[]>(FEEDBACK_BASE, `/tags${query}`, {
    method: "GET",
  });
};

export const postFeedback = (payload: FeedbackSubmit) =>
  request<void>(FEEDBACK_BASE, "", {
    method: "POST",
    body: JSON.stringify(payload),
  });
