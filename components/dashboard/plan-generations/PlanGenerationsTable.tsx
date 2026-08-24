'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ExternalLink, Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetFailedPlanGenerations } from '@/hooks/admin/useGetFailedPlanGenerations';
import type { FailedPlanGeneration } from '@/lib/types';
import { API_URL } from '@/constants';
import { formatDate } from '@/lib/format';

const PAGE_SIZE = 20;
const COLUMN_COUNT = 8;

const QUEUE_FAILED_URL = `${API_URL}/queues/queue/plan-generation?status=failed`;

const typeBadge = (type: 'WORKOUT' | 'MEAL') => (
  <Badge
    className={
      type === 'WORKOUT'
        ? 'bg-blue-100 text-blue-700'
        : 'bg-emerald-100 text-emerald-700'
    }
  >
    {type === 'WORKOUT' ? 'Workout' : 'Meal'}
  </Badge>
);


const quotaCell = (row: FailedPlanGeneration) => {
  if (row.quotaAvailable === null) return <span className="text-gray-400">—</span>;

  const hasCounts =
    typeof row.quotaUsed === 'number' && typeof row.quotaLimit === 'number';

  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      {row.quotaAvailable ? (
        <Badge className="bg-green-100 text-green-700">Has credits</Badge>
      ) : (
        <Badge className="bg-amber-100 text-amber-700">No credits</Badge>
      )}
      {hasCounts && (
        <span
          className="text-xs text-slate-500 tabular-nums"
          title={`${row.quotaUsed} of ${row.quotaLimit} ${row.type === 'WORKOUT' ? 'workout' : 'meal'} plan credits used this period`}
        >
          {row.quotaUsed}/{row.quotaLimit} used
        </span>
      )}
    </div>
  );
};

export default function PlanGenerationsTable() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);

  // Debounce so each keystroke does not fire a query.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setOffset(0);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const filters = useMemo(
    () => ({ search, offset, limit: PAGE_SIZE }),
    [search, offset]
  );

  const { data, isLoading, isError, error } =
    useGetFailedPlanGenerations(filters);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const rangeStart = total === 0 ? 0 : Math.min(offset + 1, total);
  const rangeEnd = Math.min(offset + PAGE_SIZE, total);
  const canPrev = offset > 0;
  const canNext = offset + PAGE_SIZE < total;

  return (
    <section className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Plan Failures
          </h2>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Failed plan-generation jobs, read live from the queue. Open a row in
            BullMQ to retry it — a successful retry marks the generation
            completed. Jobs leave this list once the failed-job retention window
            elapses.
          </p>
        </div>
        <Button variant="outline" asChild>
          <a href={QUEUE_FAILED_URL} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-1" />
            Open BullMQ Failed Queue
          </a>
        </Button>
      </div>

      <div className="relative max-w-md bg-white border border-gray-200 rounded-md shadow-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by user, email or job id..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </div>

      {data?.truncated && (
        <p className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 rounded-md px-3 py-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          More failures exist in the queue than were scanned — only the most
          recent ones are listed here.
        </p>
      )}

      <div className="rounded-md border border-gray-200 shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Job ID</TableHead>
              <TableHead className="text-right">Attempts</TableHead>
              <TableHead>Error</TableHead>
              <TableHead className="whitespace-nowrap">Failed At</TableHead>
              <TableHead className="whitespace-nowrap">Plan Credits</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(3)].map((_, i) => (
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
                  className="text-center text-red-600"
                >
                  {error instanceof Error
                    ? error.message
                    : 'Could not load plan failures.'}
                </TableCell>
              </TableRow>
            ) : items.length > 0 ? (
              items.map((row) => (
                <TableRow key={row.jobId} className="hover:bg-gray-50">
                  <TableCell
                    className="font-medium text-slate-800"
                    title={row.userEmail || undefined}
                  >
                    {row.userName}
                  </TableCell>
                  <TableCell>{typeBadge(row.type)}</TableCell>
                  <TableCell
                    className="font-mono text-xs max-w-[220px] truncate"
                    title={row.jobId}
                  >
                    {row.jobId}
                  </TableCell>
                  <TableCell className="text-right tabular-nums whitespace-nowrap">
                    {typeof row.maxAttempts === 'number'
                      ? `${row.attempts} / ${row.maxAttempts}`
                      : row.attempts}
                  </TableCell>
                  <TableCell
                    className="max-w-[280px] truncate text-sm text-slate-700"
                    title={row.error ?? undefined}
                  >
                    {row.error ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-slate-600">
                    {formatDate(row.failedAt)}
                  </TableCell>
                  <TableCell>{quotaCell(row)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={row.bullBoardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Open in BullMQ
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={COLUMN_COUNT}
                  className="text-center text-muted-foreground"
                >
                  No plan generation failures.
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
            : `Showing ${rangeStart}-${rangeEnd} of ${total}`}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!canPrev}
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!canNext}
            onClick={() => setOffset(offset + PAGE_SIZE)}
          >
            Next
          </Button>
        </div>
      </div>
    </section>
  );
}
