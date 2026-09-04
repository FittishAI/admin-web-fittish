'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Search,
  Ticket,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import StatTile from '@/components/dashboard/StatTile';
import TablePagination from '@/components/dashboard/TablePagination';
import PromoRedemptionsChart from '@/components/dashboard/promo-codes/PromoRedemptionsChart';
import PromoCampaignsChart from '@/components/dashboard/promo-codes/PromoCampaignsChart';
import { RedemptionStatusBadge } from '@/components/dashboard/promo-codes/PromoBadges';
import {
  ALL_FILTER,
  ANALYTICS_RANGE_OPTIONS,
  DEFAULT_ANALYTICS_RANGE,
} from '@/constants/promo';
import { useGetAllRedemptions } from '@/hooks/admin/useGetAllRedemptions';
import { useGetPromoOverview } from '@/hooks/admin/useGetPromoOverview';
import { useGetPromotionAnalytics } from '@/hooks/admin/useGetPromotionAnalytics';
import { useTableControls } from '@/hooks/useTableControls';
import {
  formatDate,
  formatDays,
  formatEntitlementExpiry,
} from '@/lib/format';

const COLUMN_COUNT = 6;

export default function PromoAnalytics() {
  const router = useRouter();
  const [range, setRange] = useState(DEFAULT_ANALYTICS_RANGE);
  const [selected, setSelected] = useState<string>(ALL_FILTER);

  const { data, isLoading, isError, error } = useGetPromoOverview(range);

  const totals = data?.totals;
  const allRows = data?.promotions ?? [];

  const selectedId = selected === ALL_FILTER ? null : Number(selected);
  const selectedRow = allRows.find((r) => r.id === selectedId) ?? null;

  const { data: single, isLoading: singleLoading } =
    useGetPromotionAnalytics(selectedId);

  const { searchInput, setSearchInput, search, offset, setOffset, pageSize } =
    useTableControls();

  const { data: redemptionsData, isLoading: redemptionsLoading } =
    useGetAllRedemptions({
      search,
      promotionId: selectedId,
      offset,
      limit: pageSize,
    });

  const redemptionRows = redemptionsData?.items ?? [];

  if (isError) {
    return (
      <section className="p-6">
        <p className="text-red-600">
          {error instanceof Error
            ? error.message
            : 'Could not load promo analytics.'}
        </p>
      </section>
    );
  }

  return (
    <section className="p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Promo Analytics
          </h2>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Every promo campaign combined — how many codes exist, how many have
            been used, and how many people they reached.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="w-[240px] bg-white">
              <SelectValue placeholder="All campaigns" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_FILTER}>All campaigns</SelectItem>
              {allRows.map((r) => (
                <SelectItem key={r.id} value={String(r.id)}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ANALYTICS_RANGE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Codes generated"
          value={totals?.codesGenerated ?? 0}
          icon={Ticket}
          loading={isLoading}
          compact
        />
        <StatTile
          label="Codes redeemed"
          value={totals?.codesRedeemed ?? 0}
          icon={CheckCircle2}
          loading={isLoading}
          compact
        />
        <StatTile
          label="Users reached"
          value={totals?.usersReached ?? 0}
          icon={Users}
          loading={isLoading}
          compact
        />
        <StatTile
          label="Live campaigns"
          value={totals?.activePromotions ?? 0}
          icon={TrendingUp}
          loading={isLoading}
        />
      </div>


      {selectedRow ? (
        <PromoRedemptionsChart
          points={single?.timeseries ?? []}
          windowStart={selectedRow.startAt}
          windowEnd={selectedRow.endAt}
          loading={singleLoading}
        />
      ) : (
        <PromoCampaignsChart rows={allRows} loading={isLoading} />
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">
              Who redeemed{selectedRow ? ` — ${selectedRow.name}` : ''}
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search user or promotion…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label="Search redemptions by user name, email or promotion name"
                className="pl-9 pr-9 h-9 rounded-full bg-slate-50 border-slate-200 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#2483FB]/30 focus-visible:border-[#2483FB]"
              />
              {searchInput && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchInput('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">

          <div className="rounded-md border border-gray-200 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead>User</TableHead>
                  <TableHead>Promotion</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="whitespace-nowrap">Redeemed on</TableHead>
                  <TableHead className="whitespace-nowrap">
                    Premium until
                  </TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redemptionsLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(COLUMN_COUNT)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : redemptionRows.length > 0 ? (
                  redemptionRows.map((r) => (
                    <TableRow key={r.id} className="hover:bg-gray-50">
                      <TableCell>
                        {r.userDeleted ? (
                          <span>
                            <span className="font-medium text-slate-500 italic">
                              Deleted account
                            </span>
                            <span className="block text-xs text-muted-foreground truncate max-w-[220px]">
                              {r.userEmail}
                            </span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="text-left"
                            onClick={() =>
                              router.push(`/dashboard/users/${r.userId}/view`)
                            }
                          >
                            <span className="font-medium text-slate-800 hover:text-[#2483FB]">
                              {r.userName ?? r.userEmail}
                            </span>
                            <span className="block text-xs text-muted-foreground truncate max-w-[220px]">
                              {r.userEmail}
                            </span>
                          </button>
                        )}
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          className="text-left text-sm text-slate-700 hover:text-[#2483FB]"
                          onClick={() =>
                            router.push(`/dashboard/promo-codes/${r.promotionId}`)
                          }
                        >
                          {r.promotionName}
                        </button>
                      </TableCell>
                      <TableCell>
                        <RedemptionStatusBadge
                          status={r.status}
                          error={r.rcError}
                        />
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                        {formatDate(r.redeemedAt)}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                        {formatEntitlementExpiry(r.entitlementExpiresAt)}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                        {formatDays(r.durationDaysAtRedemption)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={COLUMN_COUNT}
                      className="text-center text-muted-foreground py-8"
                    >
                      <Ticket className="w-5 h-5 mx-auto mb-2 opacity-50" />
                      {search || selectedRow
                        ? 'No redemptions match these filters.'
                        : 'Nobody has redeemed a promo code yet.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <TablePagination
            total={redemptionsData?.total ?? 0}
            offset={offset}
            pageSize={pageSize}
            disabled={redemptionsLoading}
            onOffsetChange={setOffset}
          />
        </CardContent>
      </Card>
    </section>
  );
}
