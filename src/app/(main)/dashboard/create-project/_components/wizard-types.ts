export type SubmitPhase = "idle" | "creating" | "done";

export type RecommendationProps<T> = {
  recommended: T | null;
  recommendedReason?: string;
  recommendationLoading: boolean;
};
