'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, CloudDownload, Info } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetOpenAiCosts } from '@/hooks/admin/useGetOpenAiCosts';
import { ApiError } from '@/lib/api/client';

const RANGES = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
] as const;

function usd(n: number): string {
  if (n === 0) return '$0.00';
  if (Math.abs(n) < 0.01) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(2)}`;
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function OpenAiCostsCard() {
  const [days, setDays] = useState<number>(30);

  const filters = useMemo(
    () => ({ from: isoDaysAgo(days), to: new Date().toISOString().slice(0, 10) }),
    [days]
  );

  const { data, isLoading, error } = useGetOpenAiCosts(filters);

  const notConfigured = error instanceof ApiError && error.status === 503;

  return (
    <Card className="mb-6">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <CloudDownload className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">OpenAI billed cost</h3>
            <span className="text-xs text-muted-foreground">
              actual organisation spend
            </span>
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

        {isLoading && <Skeleton className="h-24 w-full" />}

        {!isLoading && notConfigured && (
          <p className="text-sm text-muted-foreground">
            Not configured. Set <code className="font-mono">OPENAI_ADMIN_KEY</code>{' '}
            on the API (Organization → Admin keys — a standard API key will not
            work) to show what OpenAI actually billed.
          </p>
        )}

        {!isLoading && error && !notConfigured && (
          <p className="text-sm text-red-600">
            {error instanceof Error ? error.message : 'Could not load OpenAI costs.'}
          </p>
        )}

        {!isLoading && data && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">OpenAI billed</p>
                <p className="text-2xl font-semibold">{usd(data.actual.totalUsd)}</p>
                <p className="text-xs text-muted-foreground uppercase">
                  {data.actual.currency}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Our estimate (tokens × rates)
                </p>
                <p className="text-2xl font-semibold">{usd(data.estimated.costUsd)}</p>
                <p className="text-xs text-muted-foreground">
                  {data.estimated.requests} tracked request
                  {data.estimated.requests === 1 ? '' : 's'}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Difference</p>
                <p
                  className={`text-2xl font-semibold ${data.varianceUsd < 0 ? 'text-red-600' : ''
                    }`}
                >
                  {usd(data.varianceUsd)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.coverage === null
                    ? 'no billed spend in range'
                    : `estimate covers ${(data.coverage * 100).toFixed(1)}% of the bill`}
                </p>
              </div>
            </div>

            {data.varianceUsd < 0 && (
              <p className="flex items-start gap-2 text-sm text-red-700 bg-red-50 rounded-md px-3 py-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                Our estimate is higher than OpenAI actually billed — the rate card
                is out of date. Correct it with{' '}
                <code className="font-mono">OPENAI_MODEL_RATES</code>.
              </p>
            )}

            {data.caveats.length > 0 && (
              <ul className="space-y-1">
                {data.caveats.map((c) => (
                  <li
                    key={c}
                    className="flex items-start gap-2 text-xs text-muted-foreground"
                  >
                    <Info className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
