
import {
  DURATION_LABELS,
  LIFETIME_SENTINEL_YEAR,
  PROMOTION_TYPE_LABELS,
} from '@/constants/promo';
import { EM_DASH, formatDate } from '@/lib/format';
import type { PromoDuration, PromotionType } from '@/lib/types';

export const durationLabel = (d: PromoDuration): string =>
  DURATION_LABELS[d] ?? d;

export const promotionTypeLabel = (t: PromotionType): string =>
  PROMOTION_TYPE_LABELS[t] ?? t;

export function formatEntitlementExpiry(iso?: string | null): string {
  if (!iso) return EM_DASH;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return EM_DASH;
  if (d.getUTCFullYear() >= LIFETIME_SENTINEL_YEAR) return 'Lifetime';
  return formatDate(iso);
}
