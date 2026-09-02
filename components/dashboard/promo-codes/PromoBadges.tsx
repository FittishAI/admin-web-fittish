import { CheckCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  PROMOTION_STATUS_LABELS,
  PROMOTION_STATUS_STYLES,
  PROMO_COPY,
  REDEMPTION_STATUS_LABELS,
  REDEMPTION_STATUS_STYLES,
  UNKNOWN_STATUS_STYLE,
} from '@/constants/promo';
import type { PromoRedemptionStatus, PromotionStatus } from '@/lib/types';

export function PromotionStatusBadge({ status }: { status: PromotionStatus }) {
  return (
    <Badge className={PROMOTION_STATUS_STYLES[status] ?? UNKNOWN_STATUS_STYLE}>
      {status === 'LIVE' && <CheckCircle className="w-3 h-3 mr-1" />}
      {PROMOTION_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}


export function RedemptionStatusBadge({
  status,
  error,
}: {
  status: PromoRedemptionStatus;
  error?: string | null;
}) {
  return (
    <Badge
      className={REDEMPTION_STATUS_STYLES[status] ?? UNKNOWN_STATUS_STYLE}
      title={
        status === 'FAILED' && error
          ? error
          : status === 'PENDING'
            ? PROMO_COPY.pendingTooltip
            : undefined
      }
    >
      {REDEMPTION_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
