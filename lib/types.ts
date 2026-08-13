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
  /** null = model has no listed price. Render as "—", NEVER as $0.00. */
  costUsd: number | null;
}

export interface TokenUsageTotals {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  requests: number;
  cachedInputTokens: number;
  /** Sum over PRICED rows only — read with `unpricedRequests`. */
  costUsd: number;
  /** >0 means the cost shown is a floor, not the full bill. */
  unpricedRequests: number;
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
