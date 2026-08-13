// Questionnaire Types

export type QuestionType =
  | "multipleChoice"
  | "text"
  | "number"
  | "boolean"
  | "scale";

export interface Option {
  id: number;
  optionText: string;
  optionOrder?: number;
  nextQuestionId?: number;
}

export interface Question {
  id: number;
  categoryId: Category;
  questionText: string;
  questionType: QuestionType;
  userLevel: UserLevel;
  dependencyQuestion: boolean;
  isRequired: boolean;
  isStartingQuestion: boolean;
  isActive: boolean;
  questionOrder?: number;
  defaultNextQuestionId?: number;
  options?: Option[];
  nextQuestion?: {
    id: number;
  };
}

export interface Questionnaire {
  id: string;
  title: string;
  description: string;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
  questions: Question[];
}

export type UserLevel = "beginer" | "intermediate" | "advance";
export type Category = "BASIC" | "MEAL" | "WORKOUT";
export type QuestionStatus = "Active" | "Inactive";

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  avatar?: string;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  height: string | null;
  heightUnit: string | null;
  weight: string | null;
  weightUnit: string | null;
  age: number | null;
  gender: string | null;
  role: string;
  isActive: boolean;
  subscriptionPlan: string;
  timezone: string;
  imageKey: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  deleteReason: string | null;
  createdAt: string;
  updatedAt: string;
  onboardingCompleted: boolean;
  planName: string | null;
  workoutPlansGenerated: number;
  mealPlansGenerated: number;
  workoutsLogged: number;
  mealsLogged: number;
  currentStreak: number;
  longestStreak: number;
}

export const TOKEN_USAGE_ACTIONS = [
  'WORKOUT_PLAN',
  'MEAL_PLAN_FROM_LIBRARY',
  'MEAL_PLAN_FULL_AI',
  'TASTE_FEED',
  'MEAL_RECOMMENDATIONS',
  'WORKOUT_RECOMMENDATIONS',
  'RECIPE_EXTRACT',
] as const;

export type TokenUsageAction = (typeof TOKEN_USAGE_ACTIONS)[number];

export interface TokenUsageRow {
  userId: number;
  name: string;
  email: string;
  action: TokenUsageAction;
  planId: number | null;
  planTitle: string | null;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  /** Subset of inputTokens billed at the cheaper cached rate. */
  cachedInputTokens: number;
  /** Subset of outputTokens; explains large output on reasoning models. */
  reasoningTokens: number;
}

/**
 * Token counts only — no money. Cost is never derived from these numbers.
 * The only cost figure in the product is OpenAI's own, shown by OpenAiCostsCard.
 */
export interface TokenUsageTotals {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  requests: number;
  cachedInputTokens: number;
}

export interface TokenUsageResponse {
  totals: TokenUsageTotals;
  items: TokenUsageRow[];
  total: number;
}

export interface TokenUsageFilters {
  search?: string;
  action?: TokenUsageAction | '';
  from?: string;
  to?: string;
  offset: number;
  limit: number;
}

// Actual OpenAI organisation cost, straight from OpenAI's Costs API via our
// backend. Every amount below is a value OpenAI returned — nothing is computed
// from tokens or a rate card on either side.

export interface OpenAiCostLineItem {
  /** e.g. "gpt-5.1, input". Null when the response is not grouped. */
  lineItem: string | null;
  /** Present only when grouped by project. */
  projectId: string | null;
  amount: number;
  currency: string;
}

export interface OpenAiCurrencyTotal {
  currency: string;
  amount: number;
}

export interface OpenAiCostBucket {
  /** ISO-8601, inclusive. */
  startTime: string;
  /** ISO-8601, exclusive. */
  endTime: string;
  /** Per-currency subtotals. Never a cross-currency sum. */
  totalsByCurrency: OpenAiCurrencyTotal[];
  lineItems: OpenAiCostLineItem[];
}

export interface OpenAiCostsResult {
  from: string;
  to: string;

  /** One entry per currency OpenAI reported. Always present. */
  totalsByCurrency: OpenAiCurrencyTotal[];

  /** The single currency in play, or null when OpenAI returned several. */
  currency: string | null;

  /**
   * Total for `currency`, or null when several currencies were returned.
   * Null means "cannot be one number", NOT zero — render totalsByCurrency.
   */
  totalAmount: number | null;

  buckets: OpenAiCostBucket[];
  bucketCount: number;
  /** Pages fetched — surfaced for pagination confidence. */
  pagesFetched: number;
}
