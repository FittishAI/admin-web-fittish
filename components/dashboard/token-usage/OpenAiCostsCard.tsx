'use client';

import { useMemo, useState } from 'react';
import { CloudDownload } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetOpenAiCosts } from '@/hooks/admin/useGetOpenAiCosts';
import { ApiError } from '@/lib/api/client';
import type { OpenAiCostsResult } from '@/lib/types';

const RANGES = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
] as const;

function money(amount: number, currency: string): string {
  const code = (currency || 'usd').toUpperCase();
  const digits = amount !== 0 && Math.abs(amount) < 0.01 ? 4 : 2;

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(amount);
  } catch {
    return `${amount.toFixed(digits)} ${code}`;
  }
}

const day = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function rollUpLineItems(data: OpenAiCostsResult) {
  const totals = new Map<string, number>();

  for (const bucket of data.buckets) {
    for (const item of bucket.lineItems) {
      const key = item.lineItem ?? item.projectId ?? 'Uncategorised';
      totals.set(key, (totals.get(key) ?? 0) + item.amount);
    }
  }

  return [...totals.entries()]
    .map(([label, amount]) => ({ label, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export default function OpenAiCostsCard() {
  const [days, setDays] = useState<number>(30);
  const [breakdown, setBreakdown] = useState(true);

  const filters = useMemo(
    () => ({
      from: isoDaysAgo(days),
      to: new Date().toISOString().slice(0, 10),
      groupByLineItem: breakdown,
    }),
    [days, breakdown]
  );

  const { data, isLoading, error } = useGetOpenAiCosts(filters);

  // 503 = the server has no OPENAI_ADMIN_KEY. That is a configuration state,
  // not a failure, so it gets instructions rather than a red error.
  const notConfigured = error instanceof ApiError && error.status === 503;
  const badRequest = error instanceof ApiError && error.status === 400;

  const lineItems = useMemo(() => (data ? rollUpLineItems(data) : []), [data]);
  const nonEmptyBuckets = useMemo(
    () => data?.buckets.filter((b) => b.amount !== 0) ?? [],
    [data]
  );

  return (
    <Card className="mb-6">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <CloudDownload className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Actual OpenAI Cost</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Billed amounts reported by OpenAI&apos;s Costs API. Not calculated
              from tokens.
            </p>
          </div>

          <div className="flex gap-1">
            {RANGES.map((r) => (
              <Button
                key={r.label}
                size="sm"
                variant={days === r.days ? 'default' : 'outline'}
                onClick={() => setDays(r.days)}
              >
                {r.label}
              </Button>
            ))}
          </div>
        </div>

        {isLoading && <Skeleton className="h-28 w-full" />}

        {!isLoading && notConfigured && (
          <p className="text-sm text-muted-foreground">
            Not configured. Set <code className="font-mono">OPENAI_ADMIN_KEY</code>{' '}
            on the API — an Admin key from Organization → Admin keys; a standard
            API key will not work.
          </p>
        )}

        {!isLoading && badRequest && (
          <p className="text-sm text-amber-700 bg-amber-50 rounded-md px-3 py-2">
            {error instanceof Error ? error.message : 'Invalid date range.'}
          </p>
        )}

        {!isLoading && error && !notConfigured && !badRequest && (
          <p className="text-sm text-red-600">
            {error instanceof Error
              ? error.message
              : 'Could not load OpenAI costs.'}
          </p>
        )}

        {!isLoading && !error && data && (
          <>
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <p className="text-3xl font-semibold">
                  {money(data.totalAmount, data.currency)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {day(data.from)} — {day(data.to)} ·{' '}
                  <span className="uppercase">{data.currency}</span> ·{' '}
                  {data.bucketCount} day{data.bucketCount === 1 ? '' : 's'}
                  {data.pagesFetched > 1 && ` · ${data.pagesFetched} pages`}
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setBreakdown((v) => !v)}
              >
                {breakdown ? 'Hide breakdown' : 'Show breakdown'}
              </Button>
            </div>

            {data.totalAmount === 0 && nonEmptyBuckets.length === 0 && (
              <p className="text-sm text-muted-foreground">
                OpenAI reported no spend in this period.
              </p>
            )}

            {breakdown && lineItems.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  By line item
                </p>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Line item</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lineItems.map((item) => (
                        <TableRow key={item.label}>
                          <TableCell className="font-mono text-xs">
                            {item.label}
                          </TableCell>
                          <TableCell className="text-right">
                            {money(item.amount, data.currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {breakdown && nonEmptyBuckets.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  By day
                </p>
                <div className="overflow-x-auto max-h-72 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {nonEmptyBuckets.map((bucket) => (
                        <TableRow key={bucket.startTime}>
                          <TableCell>{day(bucket.startTime)}</TableCell>
                          <TableCell className="text-right">
                            {money(bucket.amount, data.currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
