'use client';

import { useMemo, useState } from 'react';
import { CloudDownload } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { isValidDateInput, localDate, localDateDaysAgo } from '@/lib/date';
import type { OpenAiCostsResult, OpenAiCurrencyTotal } from '@/lib/types';

const PRESETS = [
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
    // Intl throws on a currency code OpenAI might introduce later.
    return `${amount.toFixed(digits)} ${code}`;
  }
}

const dayLabel = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC', // buckets are UTC days; render them as such
  });

/** Rolls line items up across every bucket, keeping currencies separate. */
function rollUpLineItems(data: OpenAiCostsResult) {
  const totals = new Map<string, { amount: number; currency: string }>();

  for (const bucket of data.buckets) {
    for (const item of bucket.lineItems) {
      const label = item.lineItem ?? item.projectId ?? 'Uncategorised';
      const key = `${label}|${item.currency}`;
      const existing = totals.get(key);
      totals.set(key, {
        amount: (existing?.amount ?? 0) + item.amount,
        currency: item.currency,
      });
    }
  }

  return [...totals.entries()]
    .map(([key, v]) => ({ label: key.split('|')[0], ...v }))
    .sort((a, b) => b.amount - a.amount);
}

function CurrencyTotals({ totals }: { totals: OpenAiCurrencyTotal[] }) {
  return (
    <div className="space-y-1">
      {totals.map((t) => (
        <p key={t.currency} className="text-2xl font-semibold">
          {money(t.amount, t.currency)}
        </p>
      ))}
    </div>
  );
}

export default function OpenAiCostsCard() {
  const [from, setFrom] = useState(() => localDateDaysAgo(30));
  const [to, setTo] = useState(() => localDate());
  const [showBreakdown, setShowBreakdown] = useState(true);

  const datesValid =
    isValidDateInput(from) && isValidDateInput(to) && from <= to;

  const applyPreset = (days: number) => {
    setFrom(localDateDaysAgo(days));
    setTo(localDate());
  };

  const activePreset = PRESETS.find(
    (p) => from === localDateDaysAgo(p.days) && to === localDate()
  )?.days;

  // groupByLineItem is deliberately CONSTANT. The breakdown toggle only hides
  // or shows already-fetched data — putting it in the query key would fire a
  // fresh OpenAI request every time the operator collapsed a table.
  const { data, isLoading, error } = useGetOpenAiCosts(
    datesValid ? { from, to, groupByLineItem: true } : {},
    datesValid
  );

  const notConfigured = error instanceof ApiError && error.status === 503;
  const badRequest = error instanceof ApiError && error.status === 400;

  const lineItems = useMemo(() => (data ? rollUpLineItems(data) : []), [data]);
  const nonEmptyBuckets = useMemo(
    () => data?.buckets.filter((b) => b.totalsByCurrency.length > 0) ?? [],
    [data]
  );

  const isEmpty =
    data && (data.totalsByCurrency.length === 0 || data.totalAmount === 0);

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
            {PRESETS.map((p) => (
              <Button
                key={p.label}
                size="sm"
                variant={activePreset === p.days ? 'default' : 'outline'}
                onClick={() => applyPreset(p.days)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-end gap-3 flex-wrap">
          <div className="space-y-1">
            <Label htmlFor="cost-from" className="text-xs">
              From
            </Label>
            <Input
              id="cost-from"
              type="date"
              value={from}
              max={to}
              onChange={(e) => setFrom(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cost-to" className="text-xs">
              To
            </Label>
            <Input
              id="cost-to"
              type="date"
              value={to}
              min={from}
              max={localDate()}
              onChange={(e) => setTo(e.target.value)}
              className="w-40"
            />
          </div>
          <p className="text-xs text-muted-foreground pb-2">
            Whole UTC days, inclusive of both ends.
          </p>
        </div>

        {!datesValid && (
          <p className="text-sm text-amber-700 bg-amber-50 rounded-md px-3 py-2">
            Pick a valid range — “From” must be a real date on or before “To”.
          </p>
        )}

        {datesValid && isLoading && <Skeleton className="h-28 w-full" />}

        {datesValid && !isLoading && notConfigured && (
          <p className="text-sm text-muted-foreground">
            Not configured. Set <code className="font-mono">OPENAI_ADMIN_KEY</code>{' '}
            on the API — an Admin key from Organization → Admin keys; a standard
            API key will not work.
          </p>
        )}

        {datesValid && !isLoading && badRequest && (
          <p className="text-sm text-amber-700 bg-amber-50 rounded-md px-3 py-2">
            {error instanceof Error ? error.message : 'Invalid date range.'}
          </p>
        )}

        {datesValid && !isLoading && error && !notConfigured && !badRequest && (
          <p className="text-sm text-red-600">
            {error instanceof Error
              ? error.message
              : 'Could not load OpenAI costs.'}
          </p>
        )}

        {datesValid && !isLoading && !error && data && (
          <>
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                {data.totalAmount !== null && data.currency !== null ? (
                  <p className="text-3xl font-semibold">
                    {money(data.totalAmount, data.currency)}
                  </p>
                ) : data.totalsByCurrency.length > 0 ? (
                  <>
                    {/* Several currencies: show each. Never add them together. */}
                    <CurrencyTotals totals={data.totalsByCurrency} />
                    <p className="text-xs text-amber-700 mt-1">
                      OpenAI reported multiple currencies — shown separately, not
                      summed.
                    </p>
                  </>
                ) : (
                  <p className="text-3xl font-semibold">—</p>
                )}

                <p className="text-xs text-muted-foreground mt-1">
                  {dayLabel(data.from)} — {dayLabel(data.to)} ·{' '}
                  {data.bucketCount} day{data.bucketCount === 1 ? '' : 's'}
                  {data.pagesFetched > 1 && ` · ${data.pagesFetched} pages`}
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowBreakdown((v) => !v)}
              >
                {showBreakdown ? 'Hide breakdown' : 'Show breakdown'}
              </Button>
            </div>

            {isEmpty && (
              <p className="text-sm text-muted-foreground">
                OpenAI reported no spend in this period.
              </p>
            )}

            {showBreakdown && lineItems.length > 0 && (
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
                        <TableRow key={`${item.label}-${item.currency}`}>
                          <TableCell className="font-mono text-xs">
                            {item.label}
                          </TableCell>
                          <TableCell className="text-right">
                            {money(item.amount, item.currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {showBreakdown && nonEmptyBuckets.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  By day (UTC)
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
                          <TableCell>{dayLabel(bucket.startTime)}</TableCell>
                          <TableCell className="text-right">
                            {bucket.totalsByCurrency
                              .map((t) => money(t.amount, t.currency))
                              .join(' + ')}
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
