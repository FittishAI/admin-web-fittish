'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CHART_CURSOR,
  CHART_GRID,
  CHART_TICK,
} from '@/constants/colors';
import {
  CHART_VISIBLE_BARS,
  MAX_CHART_LABEL_CHARS,
  PROMOTION_STATUS_CHART_FILLS,
  PROMOTION_STATUS_LABELS,
} from '@/constants/promo';
import { niceIntegerTicks } from '@/lib/chart';
import { formatNumber, truncateLabel } from '@/lib/format';
import type { PromoOverviewRow, PromotionStatus } from '@/lib/types';

interface Datum {
  id: number;
  name: string;
  redeemed: number;
  capacity: number;
  status: PromotionStatus;
}

const STATUS_ORDER: PromotionStatus[] = [
  'LIVE',
  'SCHEDULED',
  'FINISHED',
  'DEACTIVATED',
];

export default function PromoCampaignsChart({
  rows,
  loading = false,
}: {
  rows: PromoOverviewRow[];
  loading?: boolean;
}) {
  const data: Datum[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    redeemed: r.redeemed,
    capacity: r.capacity,
    status: r.status,
  }));

  const legendStatuses = STATUS_ORDER.filter((st) =>
    data.some((d) => d.status === st),
  );

  const isEmpty = data.every((d) => d.redeemed === 0);
  const maxRedeemed = data.reduce((m, d) => Math.max(m, d.redeemed), 0);

  const axis = niceIntegerTicks(maxRedeemed);
  const overflows = data.length > CHART_VISIBLE_BARS;

  const plotWidth = overflows
    ? `${(data.length / CHART_VISIBLE_BARS) * 100}%`
    : '100%';

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <CardTitle className="text-base">Redemptions by campaign</CardTitle>
          {!loading && data.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {formatNumber(data.length)} campaign
              {data.length === 1 ? '' : 's'}
              {overflows && ' · scroll for more'}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <Skeleton className="h-72 w-full" />
        ) : data.length === 0 || isEmpty ? (
          <div className="flex h-72 flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-slate-700">
              Nothing redeemed yet
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Once codes start being used, each campaign appears here as its
              own bar.
            </p>
          </div>
        ) : (
          <div
            className="overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'thin' }}
          >
            <div className="h-72" style={{ width: plotWidth }}>
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
                    tickFormatter={(v: string) =>
                      truncateLabel(v, MAX_CHART_LABEL_CHARS)
                    }
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    tick={{ fill: CHART_TICK, fontSize: 11 }}
                    height={64}
                    angle={-35}
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
                    domain={[0, axis.max]}
                    ticks={axis.ticks}
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
                    labelFormatter={(label) => String(label)}
                    formatter={(value, _n, item) => {
                      const d = item?.payload as Datum | undefined;
                      const cap = d?.capacity ?? 0;
                      const pct =
                        cap > 0 ? ((Number(value) / cap) * 100).toFixed(0) : '0';
                      const st = d ? PROMOTION_STATUS_LABELS[d.status] : '';
                      return [
                        `${formatNumber(Number(value))} of ${formatNumber(cap)} (${pct}%) · ${st}`,
                        'Codes redeemed',
                      ];
                    }}
                  />
                  <Bar
                    dataKey="redeemed"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={56}
                  >
                    {data.map((d) => (
                      <Cell
                        key={d.id}
                        fill={PROMOTION_STATUS_CHART_FILLS[d.status]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {!loading && !isEmpty && legendStatuses.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
            {legendStatuses.map((st) => (
              <span key={st} className="flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: PROMOTION_STATUS_CHART_FILLS[st] }}
                />
                <span className="text-xs text-muted-foreground">
                  {PROMOTION_STATUS_LABELS[st]}
                </span>
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
