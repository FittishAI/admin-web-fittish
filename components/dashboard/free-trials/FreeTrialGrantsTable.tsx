'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Search,
  ShieldCheck,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
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
import TablePagination from '@/components/dashboard/TablePagination';
import { useTableControls } from '@/hooks/useTableControls';
import { useGetFreeTrialGrants } from '@/hooks/admin/useGetFreeTrialGrants';
import { formatDate, formatNumber } from '@/lib/format';
import type { FreeTrialGrantEntry, FreeTrialGrantUserRow } from '@/lib/types';

const COLUMN_COUNT = 6;

const isAdminGrant = (g: FreeTrialGrantEntry) => g.source === 'ADMIN_GRANT';

const GrantPill = ({ grant }: { grant: FreeTrialGrantEntry }) => {
  const admin = isAdminGrant(grant);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums border ${admin
        ? 'bg-blue-50 text-[#2483FB] border-blue-100'
        : 'bg-slate-100 text-slate-600 border-slate-200'
        }`}
      title={
        `${grant.days} days · ${formatDate(grant.grantedAt)} → ${formatDate(grant.newTrialEndsAt)}` +
        (admin
          ? ` · granted by ${grant.grantedByEmail ?? 'an admin'}`
          : ' · automatic 6-month reset') +
        (grant.quotaReset ? ' · plan usage reset to 0' : '')
      }
    >
      {admin ? (
        <ShieldCheck className="w-3 h-3" />
      ) : (
        <RotateCcw className="w-3 h-3" />
      )}
      {grant.days}d
    </span>
  );
};

const TrialStatus = ({ row }: { row: FreeTrialGrantUserRow }) =>
  row.trialActive ? (
    <span
      className="text-sm font-medium text-slate-700 whitespace-nowrap"
      title={`Ends ${formatDate(row.effectiveTrialEndsAt)}`}
    >
      {row.trialDaysRemaining} day{row.trialDaysRemaining === 1 ? '' : 's'} left
      <span className="block text-xs text-muted-foreground font-normal">
        until {formatDate(row.effectiveTrialEndsAt)}
      </span>
    </span>
  ) : (
    <span className="text-sm font-medium text-amber-600 whitespace-nowrap">
      Expired
      <span className="block text-xs text-muted-foreground font-normal">
        on {formatDate(row.effectiveTrialEndsAt)}
      </span>
    </span>
  );

const GrantHistory = ({ row }: { row: FreeTrialGrantUserRow }) => (
  <div className="bg-slate-50/70 px-6 py-3">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
      Grant history — newest first
    </p>
    <div className="space-y-1.5">
      {row.grants.map((g) => (
        <div
          key={g.id}
          className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"
        >
          <GrantPill grant={g} />
          <span className="text-slate-700">
            {formatDate(g.grantedAt)}{' '}
            <span className="text-muted-foreground">→</span>{' '}
            {formatDate(g.newTrialEndsAt)}
          </span>
          <span className="text-xs text-muted-foreground">
            {isAdminGrant(g)
              ? `by ${g.grantedByEmail ?? 'admin'}`
              : 'automatic 6-month reset'}
          </span>
          {g.quotaReset && (
            <span className="text-xs text-slate-600">plan usage reset to 0</span>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default function FreeTrialGrantsTable() {
  const router = useRouter();
  const { searchInput, setSearchInput, search, offset, setOffset, pageSize } =
    useTableControls();
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const filters = useMemo(
    () => ({ search, offset, limit: pageSize }),
    [search, offset, pageSize]
  );

  const { data, isLoading, isError, error } = useGetFreeTrialGrants(filters);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const toggle = (userId: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });

  return (
    <section className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Free Trials</h2>
        <p className="text-sm text-muted-foreground max-w-3xl">
          This page lists <strong>two kinds of free trial only</strong>: the ones
          an admin granted from the Users page, and the automatic 6-month reset.
          Most recent first — expand a row to see each one, with the days given,
          who gave it, and the dates it covered.
        </p>
        <p className="text-sm text-muted-foreground max-w-3xl mt-2">
          The 7-day trial every user gets at signup is not shown here.
        </p>
      </div>

      <div className="relative max-w-md bg-white border border-gray-200 rounded-md shadow-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </div>

      {data?.truncated && (
        <p className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 rounded-md px-3 py-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          More users have been granted trials than were scanned — only the most
          recent ones are listed.
        </p>
      )}

      <div className="rounded-md border border-gray-200 shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="w-10" />
              <TableHead>User</TableHead>
              <TableHead
                className="whitespace-nowrap"
                title="Admin grants plus automatic 6-month resets only. The 7-day signup trial is not counted."
              >
                Trials given
              </TableHead>
              <TableHead>Each trial</TableHead>
              <TableHead className="whitespace-nowrap">Current trial</TableHead>
              <TableHead className="whitespace-nowrap">Last granted</TableHead>
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
                    : 'Could not load free trial grants.'}
                </TableCell>
              </TableRow>
            ) : items.length > 0 ? (
              items.flatMap((row) => {
                const open = expanded.has(row.userId);
                return [
                  <TableRow
                    key={row.userId}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggle(row.userId)}
                  >
                    <TableCell className="text-muted-foreground">
                      {open ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        className="text-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/users/${row.userId}/view`);
                        }}
                      >
                        <span className="font-medium text-slate-800 hover:text-[#2483FB]">
                          {row.name}
                        </span>
                        <span className="block text-xs text-muted-foreground truncate max-w-[220px]">
                          {row.email}
                        </span>
                      </button>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium tabular-nums text-slate-800">
                        {row.totalGrants}×
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {row.totalDays} days total
                        {row.autoResets > 0 &&
                          ` · ${row.autoResets} automatic`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[260px]">
                        {row.grants.slice(0, 6).map((g) => (
                          <GrantPill key={g.id} grant={g} />
                        ))}
                        {row.grants.length > 6 && (
                          <span className="text-xs text-muted-foreground self-center">
                            +{row.grants.length - 6} more
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <TrialStatus row={row} />
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                      {formatDate(row.lastGrantedAt)}
                    </TableCell>
                  </TableRow>,
                  open ? (
                    <TableRow key={`${row.userId}-history`}>
                      <TableCell colSpan={COLUMN_COUNT} className="p-0">
                        <GrantHistory row={row} />
                      </TableCell>
                    </TableRow>
                  ) : null,
                ].filter(Boolean);
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={COLUMN_COUNT}
                  className="text-center text-muted-foreground py-8"
                >
                  <CalendarClock className="w-5 h-5 mx-auto mb-2 opacity-50" />
                  No free trials have been granted yet. Select users on the Users
                  page and use <strong>Extend Free Trial</strong>.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        total={total}
        offset={offset}
        pageSize={pageSize}
        disabled={isLoading}
        onOffsetChange={setOffset}
      />
    </section>
  );
}
