'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/format';

export default function TablePagination({
  total,
  offset,
  pageSize,
  onOffsetChange,
  disabled = false,
}: {
  total: number;
  offset: number;
  pageSize: number;
  onOffsetChange: (offset: number) => void;
  disabled?: boolean;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.floor(offset / pageSize) + 1;

  const rangeStart = total === 0 ? 0 : Math.min(offset + 1, total);
  const rangeEnd = Math.min(offset + pageSize, total);

  const go = (page: number) => onOffsetChange((page - 1) * pageSize);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        {total === 0
          ? 'No results'
          : `Showing ${formatNumber(rangeStart)}–${formatNumber(rangeEnd)} of ${formatNumber(total)}`}
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || current <= 1}
          onClick={() => go(current - 1)}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Prev
        </Button>

        {pageNumbers(current, pageCount).map((p, i) =>
          p === ELLIPSIS ? (
            <span
              key={`gap-${i}`}
              className="px-2 text-sm text-muted-foreground select-none"
            >
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={p === current ? 'default' : 'outline'}
              size="sm"
              disabled={disabled}
              aria-current={p === current ? 'page' : undefined}
              className="min-w-9 tabular-nums"
              onClick={() => go(p)}
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="sm"
          disabled={disabled || current >= pageCount}
          onClick={() => go(current + 1)}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

const ELLIPSIS = -1;


function pageNumbers(current: number, pageCount: number): number[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, pageCount, current]);
  for (let d = 1; d <= 2; d += 1) {
    if (current - d > 1) pages.add(current - d);
    if (current + d < pageCount) pages.add(current + d);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const withGaps: number[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) withGaps.push(ELLIPSIS);
    withGaps.push(p);
  });
  return withGaps;
}
