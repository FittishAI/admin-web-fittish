'use client';

import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  formatNumber,
  formatUtcDayLong,
  formatUtcDayShort,
  utcDayOf,
  utcDayRange,
} from '@/lib/format';
import {
  CHART_BLUE,
  CHART_CURSOR,
  CHART_GRID,
  CHART_TICK,
} from '@/constants/colors';
import { MAX_CHART_DAYS } from '@/constants/promo';
import type { PromoDailyPoint } from '@/lib/types';

export type PromoRedemptionPoint = PromoDailyPoint;


export default function PromoRedemptionsChart({
  points,
  windowStart,
  windowEnd,
  loading = false,
}: {
  points: PromoRedemptionPoint[];
  /** Promotion `startAt` as a full ISO instant. */
  windowStart: string;
  /** Promotion `endAt` as a full ISO instant. */
  windowEnd: string;
  loading?: boolean;
}) {
  const data = useMemo(() => {
    const counts = new Map(points.map((p) => [p.date, p.count]));
    const today = new Date().toISOString().slice(0, 10);
    const start = utcDayOf(windowStart);
    const endOfWindow = utcDayOf(windowEnd);
    const end = endOfWindow < today ? endOfWindow : today;

    const days = utcDayRange(start, end, MAX_CHART_DAYS);
    if (!days.length) {
      return [...points].sort((a, b) => a.date.localeCompare(b.date));
    }

    return days.map((date) => ({ date, count: counts.get(date) ?? 0 }));
  }, [points, windowStart, windowEnd]);

  const tickInterval = Math.max(0, Math.floor(data.length / 6) - 1);

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const isEmpty = total === 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Redemptions per day</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-64">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-sm font-medium text-slate-700">
                No redemptions yet
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Once people start redeeming, this chart will show how many did
                so on each day.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 8, right: 12, bottom: 4, left: 4 }}
              >
                <CartesianGrid vertical={false} stroke={CHART_GRID} strokeWidth={1} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatUtcDayShort}
                  interval={tickInterval}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: CHART_TICK, fontSize: 11 }}
                  height={46}
                  label={{
                    value: 'Date',
                    position: 'insideBottom',
                    offset: 4,
                    fill: CHART_TICK,
                    fontSize: 11,
                  }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: CHART_TICK, fontSize: 11 }}
                  width={68}
                  label={{
                    value: 'Users who redeemed',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' },
                    fill: CHART_TICK,
                    fontSize: 11,
                  }}
                />
                <Tooltip
                  cursor={{ stroke: CHART_CURSOR, strokeWidth: 1 }}
                  labelFormatter={(d) => formatUtcDayLong(String(d))}
                  formatter={(value) => [
                    formatNumber(Number(value)),
                    'Users who redeemed',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={CHART_BLUE}
                  strokeWidth={2}
                  fill={CHART_BLUE}
                  fillOpacity={0.12}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
