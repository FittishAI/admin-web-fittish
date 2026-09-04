
import type {
  PromoBasisPlan,
  PromoRedemptionStatus,
  PromotionStatus,
  PromotionType,
} from '@/lib/types';

/* --------------------------------- labels --------------------------------- */

export const PROMOTION_TYPE_LABELS: Record<PromotionType, string> = {
  CUSTOM: 'Custom code',
  ONE_TIME: 'One-time codes',
};


export const PRODUCT_TYPE_LABELS: Record<PromoBasisPlan, string> = {
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly',
};

export const SELECTABLE_PRODUCT_TYPES: PromoBasisPlan[] = ['MONTHLY', 'YEARLY'];

export const PROMOTION_STATUS_LABELS: Record<PromotionStatus, string> = {
  LIVE: 'Live',
  SCHEDULED: 'Scheduled',
  FINISHED: 'Finished',
  DEACTIVATED: 'Deactivated',
};

export const REDEMPTION_STATUS_LABELS: Record<PromoRedemptionStatus, string> = {
  GRANTED: 'Granted',
  PENDING: 'Pending',
  FAILED: 'Failed',
};

/* --------------------------------- styles --------------------------------- */

export const PROMOTION_STATUS_STYLES: Record<PromotionStatus, string> = {
  LIVE: 'bg-green-100 text-green-700',
  SCHEDULED: 'bg-blue-100 text-blue-700',
  FINISHED: 'bg-gray-200 text-gray-600',
  DEACTIVATED: 'bg-red-100 text-red-700',
};

export const REDEMPTION_STATUS_STYLES: Record<PromoRedemptionStatus, string> = {
  GRANTED: 'bg-green-100 text-green-700',
  PENDING: 'bg-amber-100 text-amber-700',
  FAILED: 'bg-red-100 text-red-700',
};

export const UNKNOWN_STATUS_STYLE = 'bg-gray-200 text-gray-600';

/* ------------------------------ filter options ---------------------------- */

/** Options for the promotions list status filter. `ALL` clears it. */
export const PROMOTION_STATUS_FILTERS: Array<{
  value: PromotionStatus | 'ALL';
  label: string;
}> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'LIVE', label: 'Live' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'FINISHED', label: 'Finished' },
  { value: 'DEACTIVATED', label: 'Deactivated' },
];

/** Options for the redemptions table status filter on a promotion. */
export const REDEMPTION_STATUS_FILTERS: Array<{
  value: PromoRedemptionStatus | 'ALL';
  label: string;
}> = [
  { value: 'ALL', label: 'All redemptions' },
  { value: 'GRANTED', label: 'Granted' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FAILED', label: 'Failed' },
];

/* ------------------------------- analytics -------------------------------- */

export const ALL_FILTER = 'ALL';

export const ANALYTICS_RANGE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '365', label: 'Last 12 months' },
  { value: 'all', label: 'All time' },
];

export const DEFAULT_ANALYTICS_RANGE = '90';

/* --------------------------------- charts --------------------------------- */

export const MAX_CHART_DAYS = 400;

export const MAX_CHART_BARS = 12;

export const MAX_CHART_LABEL_CHARS = 14;

/* ---------------------------------- copy ---------------------------------- */

export const PROMO_COPY = {
  pendingTooltip:
    'RevenueCat did not confirm the grant. The slot is still held — it resolves ' +
    'when the user retries or when the webhook reconciles.',
  lifetime: 'Lifetime',
} as const;

/* --------------------------------- limits --------------------------------- */


export const LIFETIME_SENTINEL_YEAR = 9999;

/**
 * Longest grant an admin can enter, in days — ten years.
 *
 * A cap exists because the value is typed by hand: a stray keystroke turning 30
 * into 300000 would hand out effectively permanent premium.
 */
export const MAX_PROMO_DAYS = 3650;

/** Mirrors the API's @Max on `codeCount`. */
export const MAX_ONE_TIME_CODES = 10_000;

/** Mirrors the API's @Max on `maxRedemptions`. */
export const MAX_CUSTOM_REDEMPTIONS = 100_000;

/** Mirrors the API's ^[A-Z0-9]{4,24}$ — no hyphens, because redemption strips them. */
export const CUSTOM_CODE_PATTERN = /^[A-Z0-9]{4,24}$/;

export const START_GRACE_MS = 5 * 60_000;
