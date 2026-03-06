export type SubmitPhase = "idle" | "creating" | "generating" | "done";

export type RecommendationProps<T> = {
  recommended: T | null;
  recommendedReason?: string;
  recommendationLoading: boolean;
};
