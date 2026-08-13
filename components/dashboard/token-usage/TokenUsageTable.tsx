'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Coins,
  ArrowDownToLine,
  ArrowUpFromLine,
  Hash,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetTokenUsage } from '@/hooks/admin/useGetTokenUsage';
import {
  TOKEN_USAGE_ACTIONS,
  TokenUsageAction,
  TokenUsageRow,
} from '@/lib/types';

const PAGE_SIZE = 20;
const ALL_ACTIONS = 'ALL';

const COLUMN_COUNT = 7;

/** WORKOUT_PLAN → "Workout Plan" */
const prettyAction = (action: string) =>
  action
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const ACTION_STYLES: Record<string, string> = {
  WORKOUT_PLAN: 'bg-blue-100 text-blue-700',
  MEAL_PLAN_FROM_LIBRARY: 'bg-emerald-100 text-emerald-700',
  MEAL_PLAN_FULL_AI: 'bg-green-100 text-green-700',
  TASTE_FEED: 'bg-purple-100 text-purple-700',
  MEAL_RECOMMENDATIONS: 'bg-teal-100 text-teal-700',
  WORKOUT_RECOMMENDATIONS: 'bg-indigo-100 text-indigo-700',
  RECIPE_EXTRACT: 'bg-amber-100 text-amber-700',
};

const num = (n: number) => n.toLocaleString();

const compact = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  loading: boolean;
}) {
  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold" title={num(value)}>
            {compact(value)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TokenUsageTable() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [action, setAction] = useState<TokenUsageAction | ''>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [offset, setOffset] = useState(0);

 
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setOffset(0);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const hasCompleteRange = Boolean(from) && Boolean(to);
  const hasPartialRange = Boolean(from) !== Boolean(to);

  const filters = useMemo(
    () => ({
      search,
      action,
      from: hasCompleteRange ? from : '',
      to: hasCompleteRange ? to : '',
      offset,
      limit: PAGE_SIZE,
    }),
    [search, action, from, to, hasCompleteRange, offset]
  );

  const { data, isLoading, isError } = useGetTokenUsage(filters);

  const totals = data?.totals;
  const items: TokenUsageRow[] = data?.items ?? [];
  const total = data?.total ?? 0;

  const rangeStart = total === 0 ? 0 : Math.min(offset + 1, total);
  const rangeEnd = Math.min(offset + PAGE_SIZE, total);
  const canPrev = offset > 0;
  const canNext = offset + PAGE_SIZE < total;

  return (
    <section className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Token Usage</h2>
        <p className="text-sm text-muted-foreground">
          GPT token consumption per user, action and model. Spend is not derived
          from these counts — see Actual OpenAI Cost above for billed amounts.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Input Tokens"
          value={totals?.inputTokens ?? 0}
          icon={ArrowDownToLine}
          loading={isLoading}
        />
        <StatCard
          label="Total Output Tokens"
          value={totals?.outputTokens ?? 0}
          icon={ArrowUpFromLine}
          loading={isLoading}
        />
        <StatCard
          label="Total Tokens"
          value={totals?.totalTokens ?? 0}
          icon={Coins}
          loading={isLoading}
        />
        <StatCard
          label="Total GPT Requests"
          value={totals?.requests ?? 0}
          icon={Hash}
          loading={isLoading}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative w-full md:max-w-sm bg-white border border-gray-200 rounded-md shadow-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search user or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={action === '' ? ALL_ACTIONS : action}
          onValueChange={(v) => {
            setAction(v === ALL_ACTIONS ? '' : (v as TokenUsageAction));
            setOffset(0);
          }}
        >
          <SelectTrigger className="w-full md:w-[230px] bg-white">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ACTIONS}>All actions</SelectItem>
            {TOKEN_USAGE_ACTIONS.map((a) => (
              <SelectItem key={a} value={a}>
                {prettyAction(a)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground whitespace-nowrap">
            From
          </label>
          <Input
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => {
              setFrom(e.target.value);
              setOffset(0);
            }}
            className="bg-white w-[150px]"
          />
          <label className="text-sm text-muted-foreground whitespace-nowrap">
            To
          </label>
          <Input
            type="date"
            value={to}
            min={from || undefined}
            onChange={(e) => {
              setTo(e.target.value);
              setOffset(0);
            }}
            className="bg-white w-[150px]"
          />
          {hasPartialRange && (
            <span className="text-xs text-amber-600 whitespace-nowrap">
              Pick both dates to apply
            </span>
          )}
        </div>

        {(search || action || from || to) && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearchInput('');
              setAction('');
              setFrom('');
              setTo('');
              setOffset(0);
            }}
          >
            Clear
          </Button>
        )}
      </div>

      <div className="rounded-md border border-gray-200 shadow-sm bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">Input Tokens</TableHead>
              <TableHead className="text-right">Output Tokens</TableHead>
              <TableHead className="text-right">Total Tokens</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(COLUMN_COUNT)].map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={COLUMN_COUNT}
                  className="text-center text-red-600 py-8"
                >
                  Failed to load token usage.
                </TableCell>
              </TableRow>
            ) : items.length > 0 ? (
              items.map((row) => (
                <TableRow
                  key={`${row.userId}-${row.action}-${row.planId ?? 'none'}`}
                >
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.email}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        ACTION_STYLES[row.action] ?? 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {prettyAction(row.action)}
                    </span>
                  </TableCell>
                  <TableCell
                    className="max-w-[240px] truncate"
                    title={row.planTitle ?? undefined}
                  >
                    {row.planTitle ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell
                    className="text-right tabular-nums"
                    title={
                      row.cachedInputTokens > 0
                        ? `${num(row.cachedInputTokens)} cached (billed at the cheaper cached rate)`
                        : undefined
                    }
                  >
                    {num(row.inputTokens)}
                    {row.cachedInputTokens > 0 && (
                      <span className="ml-1 text-xs text-sky-600">
                        ({num(row.cachedInputTokens)} cached)
                      </span>
                    )}
                  </TableCell>
                  <TableCell
                    className="text-right tabular-nums"
                    title={
                      row.reasoningTokens > 0
                        ? `${num(row.reasoningTokens)} reasoning tokens (already billed as output)`
                        : undefined
                    }
                  >
                    {num(row.outputTokens)}
                    {row.reasoningTokens > 0 && (
                      <span className="ml-1 text-xs text-violet-600">
                        ({num(row.reasoningTokens)} reasoning)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">
                    {num(row.totalTokens)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={COLUMN_COUNT}
                  className="text-center text-muted-foreground py-8"
                >
                  No token usage recorded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total === 0
            ? 'No results'
            : `Showing ${rangeStart}–${rangeEnd} of ${total}`}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!canPrev}
            onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
          >
            ‹ Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!canNext}
            onClick={() => setOffset((o) => o + PAGE_SIZE)}
          >
            Next ›
          </Button>
        </div>
      </div>
    </section>
  );
}
