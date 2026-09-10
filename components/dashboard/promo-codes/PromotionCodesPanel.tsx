'use client';

import { useState } from 'react';
import { Ticket } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TablePagination from '@/components/dashboard/TablePagination';
import PromoCodeChip from '@/components/dashboard/promo-codes/PromoCodeChip';
import { CODE_AVAILABILITY_FILTERS } from '@/constants/promo';
import { useGetPromotionCodes } from '@/hooks/admin/useGetPromotionCodes';
import { formatNumber } from '@/lib/format';
import type { PromoCodeAvailabilityFilter } from '@/lib/types';

const PAGE_SIZE = 100;

export default function PromotionCodesPanel({
  promotionId,
  promotionName,
  codesCount,
}: {
  promotionId: number;
  promotionName: string;
  codesCount: number;
}) {
  const [availability, setAvailability] =
    useState<PromoCodeAvailabilityFilter>('AVAILABLE');
  const [offset, setOffset] = useState(0);

  const { data, isLoading, isError, error } = useGetPromotionCodes(
    promotionId,
    { offset, limit: PAGE_SIZE, availability },
    true
  );

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-3 rounded-md border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-800">
            Codes in {promotionName}
          </h4>
          {data && (
            <p className="text-xs text-muted-foreground">
              {formatNumber(data.availableTotal)} of{' '}
              {formatNumber(codesCount)} still available
            </p>
          )}
        </div>
        <Select
          value={availability}
          onValueChange={(v) => {
            setAvailability(v as PromoCodeAvailabilityFilter);
            setOffset(0);
          }}
        >
          <SelectTrigger className="w-[170px] bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CODE_AVAILABILITY_FILTERS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isError ? (
        <p className="py-6 text-center text-sm text-red-600">
          {error instanceof Error ? error.message : 'Could not load the codes.'}
        </p>
      ) : isLoading ? (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          <Ticket className="mx-auto mb-2 h-5 w-5 opacity-50" />
          {availability === 'AVAILABLE'
            ? 'Every code in this promotion has been redeemed.'
            : availability === 'USED'
              ? 'No code has been redeemed yet.'
              : 'This promotion has no codes.'}
        </p>
      ) : (
        <div className="max-h-[320px] overflow-y-auto rounded-md border border-gray-100">
          <div className="grid grid-cols-1 gap-px bg-gray-100 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((c) => (
              <div
                key={c.code}
                className="flex items-center justify-between gap-2 bg-white px-3 py-2"
              >
                <PromoCodeChip code={c.code} />
                {c.availability === 'AVAILABLE' ? (
                  <Badge className="bg-emerald-100 text-emerald-700">
                    Available
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-600">Used</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {total > PAGE_SIZE && (
        <TablePagination
          total={total}
          offset={offset}
          pageSize={PAGE_SIZE}
          onOffsetChange={setOffset}
          disabled={isLoading}
        />
      )}
    </div>
  );
}
