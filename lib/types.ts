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
  walkthroughCompleted?: number;
  walkthroughTotal?: number;
  freeTrialEndsAt?: string | null;
  effectiveTrialEndsAt?: string;
  trialSource?: 'STORED' | 'FALLBACK';
  trialActive?: boolean;
  trialDaysRemaining?: number;
  freeTrialResetCount?: number;
  paymentStatus?: string | null;
  trialGrantCount?: number;
  trialGrantDaysTotal?: number;
  lastTrialGrantAt?: string | null;

  workoutPlanUsage?: number | null;
  workoutPlanLimit?: number | null;
  mealPlanUsage?: number | null;
  mealPlanLimit?: number | null;
  lastAppOpenAt?: string | null;
  lastLoginAt?: string | null;
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
  /** When the plan was created; null for rows with no plan. */
  planCreatedAt?: string | null;
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

// Admin dashboard — real aggregates from GET /admin/dashboard-stats.

export interface DashboardStats {
  totals: {
    users: number;
    activeUsers7d: number;
    onboarded: number;
    newThisWeek: number;
  };
  signupsByDay: { date: string; count: number }[];
  funnel: {
    signedUp: number;
    assessmentCompleted: number;
    planRequested: number;
    planGenerated: number;
  };
  recentUsers: {
    id: number;
    name: string;
    email: string;
    createdAt: string;
  }[];
}

// Users list — paginated response from GET /admin/users.

export interface AdminUsersPage {
  items: AdminUser[];
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

export interface FailedPlanGeneration {
  jobId: string;
  generationId: string;
  userId: number;
  userName: string;
  userEmail: string;
  type: 'WORKOUT' | 'MEAL';
  attempts: number;
  maxAttempts?: number | null;
  error: string | null;
  failedAt: string | null;
  quotaAvailable: boolean | null;
  quotaUsed?: number | null;
  quotaLimit?: number | null;
  bullBoardUrl: string;
}

export interface FailedPlanGenerationsPage {
  items: FailedPlanGeneration[];
  total: number;
  truncated: boolean;
}

export interface FailedPlanGenerationFilters {
  search?: string;
  offset: number;
  limit: number;
}

/* ------------------------- free trial (admin grant) ------------------------ */

export type ExtendTrialOutcome =
  | 'EXTENDED'
  | 'EXTENDED_USAGE_CREATED'
  | 'SKIPPED_PAID_PLAN'
  /** Became non-FREE between the read and the write. Skipped, not fatal. */
  | 'SKIPPED_PLAN_CHANGED'
  | 'SKIPPED_NO_SUBSCRIPTION'
  | 'SKIPPED_DELETED'
  | 'SKIPPED_NOT_FOUND';

export interface ExtendTrialUserResult {
  userId: number;
  email: string | null;
  outcome: ExtendTrialOutcome;
  planName: string | null;
  paymentStatus: string | null;
  previousTrialEndsAt: string | null;
  previousEffectiveTrialEndsAt: string | null;
  newTrialEndsAt: string | null;
  wasExpired: boolean | null;
  /** True when the grant landed EARLIER than the trial the user already had. */
  shortened: boolean;
  quotaReset: boolean;
  previousMealPlanUsage: number | null;
  previousWorkoutPlanUsage: number | null;
  reason: string | null;
}

export interface ExtendTrialResult {
  batchId: string;
  /** True when this request had already been applied and nothing changed. */
  replayed: boolean;
  grantedAt: string;
  days: number;
  newTrialEndsAt: string;
  resetQuota: boolean;
  grantedBy: { adminId: number; email: string };
  summary: {
    requested: number;
    unique: number;
    extended: number;
    skipped: number;
    quotaResets: number;
    shortened: number;
    usageRowsCreated: number;
  };
  results: ExtendTrialUserResult[];
}

export interface ExtendTrialPayload {
  userIds: number[];
  days: number;
  resetQuota: boolean;
  /** Idempotency key — the same value can never grant twice. */
  requestId: string;
}

/** Hard cap enforced by the API's @ArrayMaxSize — mirrored here for the UI. */
export const MAX_TRIAL_GRANT_USERS = 500;

export interface FreeTrialGrantEntry {
  id: number;
  /** ADMIN_GRANT or AUTO_RESET_6_MONTH. */
  source: string;
  days: number;
  grantedAt: string;
  newTrialEndsAt: string;
  previousTrialEndsAt: string | null;
  wasExpired: boolean;
  quotaReset: boolean;
  grantedByEmail: string | null;
}

export interface FreeTrialGrantUserRow {
  userId: number;
  name: string;
  email: string;
  planName: string | null;
  effectiveTrialEndsAt: string;
  trialActive: boolean;
  trialDaysRemaining: number;
  totalGrants: number;
  adminGrants: number;
  autoResets: number;
  totalDays: number;
  lastGrantedAt: string;
  /** Newest first. */
  grants: FreeTrialGrantEntry[];
}

export interface FreeTrialGrantsPage {
  items: FreeTrialGrantUserRow[];
  total: number;
  truncated: boolean;
}

export interface FreeTrialGrantFilters {
  search?: string;
  offset: number;
  limit: number;
}

export type PromotionType = 'CUSTOM' | 'ONE_TIME';


export type PromoBasisPlan = 'MONTHLY' | 'YEARLY';

export type PromotionStatus = 'DEACTIVATED' | 'SCHEDULED' | 'LIVE' | 'FINISHED';

export type PromoRedemptionStatus = 'PENDING' | 'GRANTED' | 'FAILED';

export interface PromotionListItem {
  id: number;
  name: string;
  type: PromotionType;
  /** Days of premium granted on redemption. */
  durationDays: number;
  /** Quota tier applied for the length of the grant. */
  basisPlan: PromoBasisPlan;
  /** Full ISO instant with an explicit offset — never a bare calendar day. */
  startAt: string;
  endAt: string;
  status: PromotionStatus;
  isActive: boolean;
  /** CUSTOM: the single shareable code. ONE_TIME: null — see `codesCount`. */
  customCode: string | null;
  codesCount: number;
  /** Σ maxRedemptions across the promotion's codes. */
  capacity: number;
  /** Σ redeemedCount — the authoritative slot counter, not a COUNT of rows. */
  redeemed: number;
  grantedCount: number;
  pendingCount: number;
  failedCount: number;
  createdByEmail: string;
  createdAt: string;
}

export interface PromotionsPage {
  items: PromotionListItem[];
  total: number;
}

export interface PromotionFilters {
  /** Matches promotion name, or an exact code. */
  search?: string;
  status?: PromotionStatus | 'ALL';
  offset: number;
  limit: number;
}

export interface PromotionDetail extends PromotionListItem {
  deactivatedAt: string | null;
  deactivatedByEmail: string | null;
}

export interface CreatePromotionPayload {
  name: string;
  type: PromotionType;
  /** Days of premium granted on redemption. */
  durationDays: number;
  /** Quota tier applied for the length of the grant. */
  basisPlan: PromoBasisPlan;
  startAt: string;
  endAt: string;
  code?: string;
  /** CUSTOM only. */
  maxRedemptions?: number;
  /** ONE_TIME only. */
  codeCount?: number;
  /** Idempotency key — the same value can never create twice. */
  requestId: string;
}

export interface CreatePromotionResult {
  id: number;
  name: string;
  type: PromotionType;
  codesCount: number;
  /** True when this requestId had already been applied; nothing was created again. */
  replayed: boolean;
}

/** One UTC day bucket. `date` is a bare "YYYY-MM-DD" — see PromoRedemptionsChart. */
export interface PromoDailyPoint {
  date: string;
  count: number;
}

/** Counts are flat on the response, not nested under a `totals` object. */
export interface PromotionAnalytics {
  granted: number;
  pending: number;
  failed: number;
  capacity: number;
  uniqueUsers: number;
  timeseries: PromoDailyPoint[];
}

export interface PromotionRedemptionRow {
  id: number;
  userId: number;
  /** Live join; falls back to the snapshot when the user has been deleted. */
  userName: string | null;
  userEmail: string;
  userDeleted: boolean;
  codeValue: string;
  /** Days granted at the time of redemption — snapshot, not the current value. */
  durationDaysAtRedemption: number;
  status: PromoRedemptionStatus;
  redeemedAt: string;
  grantedAt: string | null;
  /** Full ISO instant. Null while PENDING or FAILED — nothing was granted. */
  entitlementExpiresAt: string | null;
  rcError: string | null;
}

export interface PromotionRedemptionsPage {
  items: PromotionRedemptionRow[];
  total: number;
}

export interface PromotionRedemptionFilters {
  status?: PromoRedemptionStatus | 'ALL';
  offset: number;
  limit: number;
}
