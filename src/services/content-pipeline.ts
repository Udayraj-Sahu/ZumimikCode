import type { ContentFeedbackRequest, ContentFeedbackResponse } from "@/lib/types/content-feedback";
import { submitFeedback as mockSubmit } from "@/lib/mock/content-pipeline";
import { apiPost } from "./api";

const IS_MOCK = process.env.NEXT_PUBLIC_API_MOCK !== "false";

export async function submitContentFeedback(data: ContentFeedbackRequest): Promise<ContentFeedbackResponse> {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return mockSubmit(data);
  }
  return apiPost<ContentFeedbackResponse>("/content/feedback", data);
}
