'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  AlertTriangle,
  ArrowLeftCircle,
  Ban,
  CheckCircle2,
  Download,
  Ticket,
  Users,
  XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  PromotionStatusBadge,
  RedemptionStatusBadge,
} from '@/components/dashboard/promo-codes/PromoBadges';
import {
  PRODUCT_TYPE_LABELS,
  PROMOTION_TYPE_LABELS,
  REDEMPTION_STATUS_FILTERS,
} from '@/constants/promo';
import { usePagination } from '@/hooks/useTableControls';
import { useDeactivatePromotion } from '@/hooks/admin/useDeactivatePromotion';
import { useGetPromotionAnalytics } from '@/hooks/admin/useGetPromotionAnalytics';
import { useGetPromotionDetail } from '@/hooks/admin/useGetPromotionDetail';
import { useGetPromotionRedemptions } from '@/hooks/admin/useGetPromotionRedemptions';
import { downloadFile, filenameSlug } from '@/lib/csv';
import {
  formatDate,
  formatDays,
  formatEntitlementExpiry,
  formatNumber,
} from '@/lib/format';
import type { PromoRedemptionStatus } from '@/lib/types';

const COLUMN_COUNT = 6;

export default function PromoCodeDetail() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const promotionId = Number(id);

  const { offset, setOffset, resetOffset, pageSize } = usePagination();
  const [status, setStatus] = useState<PromoRedemptionStatus | 'ALL'>('ALL');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { data: promo, isLoading, isError, error } =
    useGetPromotionDetail(promotionId);
  const { data: analytics, isLoading: analyticsLoading } =
    useGetPromotionAnalytics(promotionId);

  const redemptionFilters = useMemo(
    () => ({ status, offset, limit: pageSize }),
    [status, offset, pageSize]
  );
  const { data: redemptions, isLoading: redemptionsLoading } =
    useGetPromotionRedemptions(promotionId, redemptionFilters);

  const { mutate: deactivate, isPending: deactivating } =
    useDeactivatePromotion();

  const handleDownload = async () => {
    if (!promo) return;
    setDownloading(true);
    try {
      await downloadFile(
        `/admin/promotions/${promo.id}/codes.csv`,
        `${filenameSlug(promo.name)}-codes.csv`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not download the codes.'
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleDeactivate = () => {
    deactivate(promotionId, {
      onSuccess: () => {
        toast.success('Success', {
          description: 'This promotion no longer accepts new redemptions.',
        });
        setConfirmOpen(false);
      },
      onError: (err: Error) =>
        toast.error(err.message || 'Could not deactivate the promotion.'),
    });
  };

  if (isLoading) {
    return (
      <section className="p-6 space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-72 w-full" />
      </section>
    );
  }

  if (isError || !promo) {
    return (
      <section className="p-6">
        <p className="text-red-600">
          {error instanceof Error
            ? error.message
            : 'Could not load this promotion.'}
        </p>
      </section>
    );
  }

  const granted = analytics?.granted ?? promo.grantedCount;
  const pending = analytics?.pending ?? promo.pendingCount;
  const failed = analytics?.failed ?? promo.failedCount;
  const items = redemptions?.items ?? [];

  return (
    <section className="p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeftCircle className="h-5 w-5 text-muted-foreground" />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold text-slate-900">
                {promo.name}
              </h2>
              <PromotionStatusBadge status={promo.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {PROMOTION_TYPE_LABELS[promo.type] ?? promo.type} ·{' '}
              {promo.type === 'CUSTOM' ? (
                <>
                  <span className="font-mono font-semibold text-slate-800">
                    {promo.customCode}
                  </span>{' '}
                  ·{' '}
                </>
              ) : (
                <>{formatNumber(promo.codesCount)} codes · </>
              )}
              {formatDays(promo.durationDays)} of premium
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Start date {formatDate(promo.startAt)} · End date{' '}
              {formatDate(promo.endAt)}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Product type{' '}
              {PRODUCT_TYPE_LABELS[promo.basisPlan] ?? promo.basisPlan} —
              redeemers get that plan&rsquo;s usage allowance
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Created by {promo.createdByEmail} on {formatDate(promo.createdAt)}
              {promo.deactivatedAt &&
                ` · deactivated ${formatDate(promo.deactivatedAt)}${promo.deactivatedByEmail ? ` by ${promo.deactivatedByEmail}` : ''
                }`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={downloading}
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-1" />
            {downloading ? 'Preparing…' : 'Download codes CSV'}
          </Button>
          {promo.isActive && (
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              onClick={() => setConfirmOpen(true)}
            >
              <Ban className="w-4 h-4 mr-1" />
              Deactivate
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Redeemed"
          value={promo.redeemed}
          icon={Ticket}
          loading={analyticsLoading}
        />
        <StatTile
          label="Capacity"
          value={analytics?.capacity ?? promo.capacity}
          icon={CheckCircle2}
          loading={analyticsLoading}
        />
        <StatTile
          label="Unique users"
          value={analytics?.uniqueUsers ?? 0}
          icon={Users}
          loading={analyticsLoading}
        />
        <StatTile
          label="Failed"
          value={failed}
          icon={XCircle}
          loading={analyticsLoading}
        />
      </div>

      {pending > 0 && (
        <p className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            <strong>{formatNumber(pending)}</strong>{' '}
            redemption
            {pending === 1 ? ' is' : 's are'} still
            pending — RevenueCat never confirmed the grant. Their code slots stay
            held. These resolve when the user retries or when RevenueCat’s
            webhook reconciles them.
          </span>
        </p>
      )}

      <PromoRedemptionsChart
        points={analytics?.timeseries ?? []}
        windowStart={promo.startAt}
        windowEnd={promo.endAt}
        loading={analyticsLoading}
      />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">Redemptions</h3>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v as PromoRedemptionStatus | 'ALL');
              resetOffset();
            }}
          >
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="All redemptions" />
            </SelectTrigger>
            <SelectContent>
              {REDEMPTION_STATUS_FILTERS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border border-gray-200 shadow-sm overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead>User</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="whitespace-nowrap">Redeemed on</TableHead>
                <TableHead className="whitespace-nowrap">Premium until</TableHead>
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
              ) : items.length > 0 ? (
                items.map((r) => (
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
                    <TableCell className="font-mono text-sm text-slate-700">
                      {r.codeValue}
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
                    {status === 'ALL'
                      ? 'Nobody has redeemed this promotion yet.'
                      : 'No redemptions with this status.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <TablePagination
          total={redemptions?.total ?? 0}
          offset={offset}
          pageSize={pageSize}
          disabled={redemptionsLoading}
          onOffsetChange={setOffset}
        />
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-600" />
              Deactivate “{promo.name}”?
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              The code will stop working immediately. Nobody new will be able to
              redeem it.
            </p>
            <p className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                The{' '}
                <strong>{formatNumber(granted)}</strong>{' '}
                {granted === 1 ? 'person' : 'people'}{' '}
                who already redeemed it <strong>keep their premium access</strong>{' '}
                until it expires. Deactivating does not take it back.
              </span>
            </p>
            <p className="text-sm text-slate-700">
              This cannot be undone. To run the campaign again, create a new
              promotion.
            </p>
          </div>

          <DialogFooter className="pt-4">
            <Button
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              disabled={deactivating}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeactivate}
              disabled={deactivating}
            >
              {deactivating ? 'Deactivating…' : 'Deactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
