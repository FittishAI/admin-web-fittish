'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Download, Plus, Search, Ticket } from 'lucide-react';

import { Button } from '@/components/ui/button';
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
import TablePagination from '@/components/dashboard/TablePagination';
import { PromotionStatusBadge } from '@/components/dashboard/promo-codes/PromoBadges';
import {
  DURATION_LABELS,
  PROMOTION_STATUS_FILTERS,
  PROMOTION_TYPE_LABELS,
} from '@/constants/promo';
import { useTableControls } from '@/hooks/useTableControls';
import { useGetPromotions } from '@/hooks/admin/useGetPromotions';
import { downloadFile, filenameSlug } from '@/lib/csv';
import { formatDate, formatNumber } from '@/lib/format';
import type { PromotionListItem, PromotionStatus } from '@/lib/types';

const COLUMN_COUNT = 8;


const CodeCell = ({ promo }: { promo: PromotionListItem }) =>
  promo.type === 'CUSTOM' ? (
    <span>
      <span className="font-mono text-sm font-semibold tracking-wide text-slate-800">
        {promo.code}
      </span>
      <span className="block text-xs text-muted-foreground">
        {PROMOTION_TYPE_LABELS[promo.type] ?? promo.type}
      </span>
    </span>
  ) : (
    <span className="text-sm text-slate-700">
      {formatNumber(promo.codesCount)} codes
      <span className="block text-xs text-muted-foreground">
        {PROMOTION_TYPE_LABELS[promo.type] ?? promo.type}
      </span>
    </span>
  );

const UsageCell = ({ promo }: { promo: PromotionListItem }) => {
  const pct = promo.capacity > 0 ? (promo.redeemed / promo.capacity) * 100 : 0;
  return (
    <div className="min-w-[110px]">
      <span className="text-sm font-medium tabular-nums text-slate-800">
        {formatNumber(promo.redeemed)}
        <span className="text-muted-foreground"> / {formatNumber(promo.capacity)}</span>
      </span>
      <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
        <div
          className="h-1.5 rounded-full bg-[#2483FB]"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      {promo.failed > 0 && (
        <span className="block text-xs text-red-600 mt-1">
          {formatNumber(promo.failed)} failed
        </span>
      )}
    </div>
  );
};

export default function PromoCodesTable() {
  const router = useRouter();
  const {
    searchInput,
    setSearchInput,
    search,
    offset,
    setOffset,
    resetOffset,
    pageSize,
  } = useTableControls();
  const [status, setStatus] = useState<PromotionStatus | 'ALL'>('ALL');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const filters = useMemo(
    () => ({ search, status, offset, limit: pageSize }),
    [search, status, offset, pageSize]
  );

  const { data, isLoading, isError, error } = useGetPromotions(filters);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const handleDownload = async (promo: PromotionListItem) => {
    setDownloadingId(promo.id);
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
      setDownloadingId(null);
    }
  };

  return (
    <section className="p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Promo Codes</h2>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Fittish promo codes give a user premium access for a fixed period{' '}
            <strong>without any store purchase</strong>. They are separate from
            the App Store and Play Store code flows.
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => router.push('/dashboard/promo-codes/create')}
        >
          <Plus className="w-4 h-4 mr-1" />
          Create promo code
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-md shadow-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, or paste a code..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as PromotionStatus | 'ALL');
            resetOffset();
          }}
        >
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            {PROMOTION_STATUS_FILTERS.map((o) => (
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
              <TableHead>Promotion name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="whitespace-nowrap">Codes redeemed</TableHead>
              <TableHead className="whitespace-nowrap">Start date</TableHead>
              <TableHead className="whitespace-nowrap">End date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
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
                  className="text-center text-red-600"
                >
                  {error instanceof Error
                    ? error.message
                    : 'Could not load promotions.'}
                </TableCell>
              </TableRow>
            ) : items.length > 0 ? (
              items.map((promo) => (
                <TableRow
                  key={promo.id}
                  className="cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={() =>
                    router.push(`/dashboard/promo-codes/${promo.id}`)
                  }
                >
                  <TableCell>
                    <span className="font-medium text-slate-800">
                      {promo.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      by {promo.createdByEmail}
                    </span>
                  </TableCell>
                  <TableCell>
                    <CodeCell promo={promo} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-slate-700">
                    {DURATION_LABELS[promo.duration] ?? promo.duration}
                  </TableCell>
                  <TableCell>
                    <UsageCell promo={promo} />
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                    {formatDate(promo.startAt)}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                    {formatDate(promo.endAt)}
                  </TableCell>
                  <TableCell>
                    <PromotionStatusBadge status={promo.status} />
                  </TableCell>
                  {/* stopPropagation: the whole row navigates on click. */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Download codes for ${promo.name}`}
                      title="Download codes CSV"
                      disabled={downloadingId === promo.id}
                      onClick={() => handleDownload(promo)}
                    >
                      <Download className="w-4 h-4 text-muted-foreground" />
                    </Button>
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
                  {search || status !== 'ALL'
                    ? 'No promotions match these filters.'
                    : 'No promo codes yet. Use Create promo code to make one.'}
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
