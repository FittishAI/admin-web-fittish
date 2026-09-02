
import type {
  PromoDuration,
  PromoRedemptionStatus,
  PromotionStatus,
  PromotionType,
} from '@/lib/types';

/* --------------------------------- labels --------------------------------- */

export const DURATION_LABELS: Record<PromoDuration, string> = {
  daily: '1 day',
  three_day: '3 days',
  weekly: '1 week',
  monthly: '1 month (30 days)',
  two_month: '2 months',
  three_month: '3 months',
  six_month: '6 months',
  yearly: '1 year',
  lifetime: 'Lifetime',
};


export const SELECTABLE_DURATIONS: PromoDuration[] = [
  'three_day',
  'weekly',
  'monthly',
  'two_month',
  'three_month',
  'six_month',
  'yearly',
  'lifetime',
];


export const PROMOTION_TYPE_LABELS: Record<PromotionType, string> = {
  CUSTOM: 'Custom code',
  ONE_TIME: 'One-time codes',
};

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

/* ---------------------------------- copy ---------------------------------- */

export const PROMO_COPY = {
  pendingTooltip:
    'RevenueCat did not confirm the grant. The slot is still held — it resolves ' +
    'when the user retries or when the webhook reconciles.',
  lifetime: 'Lifetime',
} as const;

/* --------------------------------- limits --------------------------------- */


export const LIFETIME_SENTINEL_YEAR = 9999;

/** Mirrors the API's @Max on `codeCount`. */
export const MAX_ONE_TIME_CODES = 10_000;

/** Mirrors the API's @Max on `maxRedemptions`. */
export const MAX_CUSTOM_REDEMPTIONS = 100_000;

/** Mirrors the API's ^[A-Z0-9]{4,24}$ — no hyphens, because redemption strips them. */
export const CUSTOM_CODE_PATTERN = /^[A-Z0-9]{4,24}$/;
