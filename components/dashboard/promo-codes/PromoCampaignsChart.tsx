'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CHART_BLUE,
  CHART_CURSOR,
  CHART_GRID,
  CHART_TICK,
} from '@/constants/colors';
import { MAX_CHART_BARS, MAX_CHART_LABEL_CHARS } from '@/constants/promo';
import { formatNumber, truncateLabel } from '@/lib/format';
import type { PromoOverviewRow } from '@/lib/types';

interface Datum {
  name: string;
  redeemed: number;
  capacity: number;
}


export default function PromoCampaignsChart({
  rows,
  loading = false,
}: {
  rows: PromoOverviewRow[];
  loading?: boolean;
}) {
  const data: Datum[] = rows.slice(0, MAX_CHART_BARS).map((r) => ({
    name: r.name,
    redeemed: r.redeemed,
    capacity: r.capacity,
  }));

  const isEmpty = data.every((d) => d.redeemed === 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Redemptions by campaign</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-72">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : data.length === 0 || isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-sm font-medium text-slate-700">
                Nothing redeemed yet
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Once codes start being used, each campaign appears here as its
                own bar.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 8, right: 12, bottom: 4, left: 4 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke={CHART_GRID}
                  strokeWidth={1}
                />
                <XAxis
                  dataKey="name"
                  tickFormatter={(v: string) => truncateLabel(v, MAX_CHART_LABEL_CHARS)}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  tick={{ fill: CHART_TICK, fontSize: 11 }}
                  height={56}
                  angle={-20}
                  textAnchor="end"
                  label={{
                    value: 'Campaign',
                    position: 'insideBottom',
                    offset: -2,
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
                    value: 'Codes redeemed',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' },
                    fill: CHART_TICK,
                    fontSize: 11,
                  }}
                />
                <Tooltip
                  cursor={{ fill: CHART_CURSOR, fillOpacity: 0.08 }}
                  formatter={(value, _n, item) => {
                    const d = item?.payload as Datum | undefined;
                    const cap = d?.capacity ?? 0;
                    const pct = cap > 0 ? ((Number(value) / cap) * 100).toFixed(0) : '0';
                    return [
                      `${formatNumber(Number(value))} of ${formatNumber(cap)} (${pct}%)`,
                      'Codes redeemed',
                    ];
                  }}
                />
                <Bar
                  dataKey="redeemed"
                  fill={CHART_BLUE}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={56}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        {rows.length > MAX_CHART_BARS && (
          <p className="text-xs text-muted-foreground mt-2">
            Showing the {MAX_CHART_BARS} most redeemed of {rows.length} campaigns.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
