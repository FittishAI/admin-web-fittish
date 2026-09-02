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
import { formatNumber, formatUtcDayLong, formatUtcDayShort } from '@/lib/format';
import {
  CHART_BLUE,
  CHART_CURSOR,
  CHART_GRID,
  CHART_TICK,
} from '@/constants/colors';

const MAX_DAYS = 400;

const DAY_MS = 86_400_000;


export interface PromoRedemptionPoint {
  day: string;
  count: number;
}


export function utcDayOf(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}


function utcDayRange(start: string, end: string): string[] {
  const from = Date.parse(`${start}T00:00:00Z`);
  const to = Date.parse(`${end}T00:00:00Z`);
  if (Number.isNaN(from) || Number.isNaN(to) || to < from) return [];

  const days: string[] = [];
  for (let t = from; t <= to && days.length < MAX_DAYS; t += DAY_MS) {
    days.push(new Date(t).toISOString().slice(0, 10));
  }
  return days;
}


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
    const counts = new Map(points.map((p) => [p.day, p.count]));
    const today = new Date().toISOString().slice(0, 10);
    const start = utcDayOf(windowStart);
    const endOfWindow = utcDayOf(windowEnd);
    const end = endOfWindow < today ? endOfWindow : today;

    const days = utcDayRange(start, end);
    if (!days.length) {
      return [...points].sort((a, b) => a.day.localeCompare(b.day));
    }

    return days.map((day) => ({ day, count: counts.get(day) ?? 0 }));
  }, [points, windowStart, windowEnd]);

  const tickInterval = Math.max(0, Math.floor(data.length / 6) - 1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Redemptions per day</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-56">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
              >
                <CartesianGrid vertical={false} stroke={CHART_GRID} strokeWidth={1} />
                <XAxis
                  dataKey="day"
                  tickFormatter={formatUtcDayShort}
                  interval={tickInterval}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: CHART_TICK, fontSize: 11 }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: CHART_TICK, fontSize: 11 }}
                  width={40}
                />
                <Tooltip
                  cursor={{ stroke: CHART_CURSOR, strokeWidth: 1 }}
                  labelFormatter={(d) => formatUtcDayLong(String(d))}
                  formatter={(value) => [formatNumber(Number(value)), 'Redemptions']}
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
        <p className="text-xs text-muted-foreground mt-2">
          Days are counted in UTC, so this chart reads the same for every admin.
        </p>
      </CardContent>
    </Card>
  );
}
