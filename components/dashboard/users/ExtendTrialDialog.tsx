'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, CalendarClock, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useExtendFreeTrial } from '@/hooks/admin/useExtendFreeTrial';
import { formatDate } from '@/lib/format';
import { MAX_TRIAL_GRANT_USERS } from '@/lib/types';
import type { AdminUser, ExtendTrialResult } from '@/lib/types';

const DAY_MS = 86_400_000;

const DIGITS_ONLY = /^\d*$/;

const DEFAULT_DAYS = '30';

function newRequestId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function ExtendTrialDialog({
  open,
  onOpenChange,
  selected,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: AdminUser[];
  onDone: () => void;
}) {
  const [daysInput, setDaysInput] = useState(DEFAULT_DAYS);
  const [resetQuota, setResetQuota] = useState(false);

  const { mutate: extendTrial, isPending } = useExtendFreeTrial();

  const requestIdRef = useRef<{ forPayload: string; id: string } | null>(null);

  const submittingRef = useRef(false);

  const days = Number(daysInput);
  const daysValid =
    DIGITS_ONLY.test(daysInput) &&
    daysInput !== '' &&
    Number.isInteger(days) &&
    days >= 1 &&
    days <= 365;

  const overCap = selected.length > MAX_TRIAL_GRANT_USERS;

  const newEnd = useMemo(
    () => (daysValid ? new Date(Date.now() + days * DAY_MS) : null),
    [days, daysValid]
  );

  const wouldShorten = useMemo(() => {
    if (!newEnd) return [];
    return selected.filter((u) => {
      const end = u.effectiveTrialEndsAt;
      return !!end && new Date(end).getTime() > newEnd.getTime();
    });
  }, [selected, newEnd]);

  const paidSelected = selected.filter(
    (u) => (u.planName ?? 'FREE') !== 'FREE'
  );

  const payloadFingerprint = useMemo(
    () =>
      JSON.stringify([
        [...selected.map((u) => u.id)].sort((a, b) => a - b),
        daysInput,
        resetQuota,
      ]),
    [selected, daysInput, resetQuota]
  );

  useEffect(() => {
    if (!open) {
      setDaysInput(DEFAULT_DAYS);
      setResetQuota(false);
      requestIdRef.current = null;
      submittingRef.current = false;
    }
  }, [open]);

  const handleSubmit = () => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    if (requestIdRef.current?.forPayload !== payloadFingerprint) {
      requestIdRef.current = {
        forPayload: payloadFingerprint,
        id: newRequestId(),
      };
    }

    extendTrial(
      {
        userIds: selected.map((u) => u.id),
        days,
        resetQuota,
        requestId: requestIdRef.current.id,
      },
      {
        onSuccess: (res: ExtendTrialResult) => {
          if (res.replayed) {
            toast.warning('Warning', {
              description:
                'This request had already been applied — nothing was changed ' +
                'a second time. Close the dialog and refresh before retrying.',
            });
            submittingRef.current = false;
            requestIdRef.current = null;
            return;
          }

          const { extended, skipped, shortened } = res.summary;
          const parts = [
            `${extended} user${extended === 1 ? '' : 's'} extended to ${formatDate(res.newTrialEndsAt)}`,
          ];
          if (shortened) parts.push(`${shortened} shortened`);
          if (skipped) parts.push(`${skipped} skipped`);

          toast.success('Success', { description: parts.join(' · ') });

          const problems = res.results.filter((r) =>
            r.outcome.startsWith('SKIPPED')
          );
          if (problems.length) {
            toast.warning('Warning', {
              description: [
                `${problems.length} user${problems.length === 1 ? ' was' : 's were'} not changed:`,
                ...problems
                  .slice(0, 4)
                  .map((r) => `${r.email ?? r.userId} — ${r.reason ?? r.outcome}`),
                ...(problems.length > 4
                  ? [`…and ${problems.length - 4} more`]
                  : []),
              ].join('\n'),
            });
          }

          submittingRef.current = false;
          requestIdRef.current = null;
          onOpenChange(false);
          onDone();
        },
        onError: (err: Error) => {
          submittingRef.current = false;
          toast.error(err.message || 'Could not extend the free trial.');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-[#2483FB]" />
            Extend Free Trial
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="trial-days"
              className="text-sm font-medium text-slate-800"
            >
              How many days of free trial do you want to give these{' '}
              {selected.length} user{selected.length === 1 ? '' : 's'}?
            </label>
            <Input
              id="trial-days"
              inputMode="numeric"
              autoComplete="off"
              value={daysInput}
              onChange={(e) => {
                if (DIGITS_ONLY.test(e.target.value)) {
                  setDaysInput(e.target.value);
                }
              }}
              placeholder="e.g. 30"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              This <strong>replaces</strong> their current trial — it does not
              add to it. Entering 30 means the trial ends 30 days from today, no
              matter how much time they have left now. Whole numbers, 1–365.
            </p>
          </div>

          {newEnd && (
            <p className="text-sm bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
              New trial end:{' '}
              <strong className="text-slate-900">
                {formatDate(newEnd.toISOString())}
              </strong>
            </p>
          )}

          {wouldShorten.length > 0 && (
            <p className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                <strong>{wouldShorten.length}</strong> selected user
                {wouldShorten.length === 1 ? ' has' : 's have'} more trial time
                left than this. Their trial will be <strong>shortened</strong>.
              </span>
            </p>
          )}

          {paidSelected.length > 0 && (
            <p className="flex items-start gap-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                Only <strong>FREE</strong> accounts can be given a trial.{' '}
                <strong>{paidSelected.length}</strong> selected user
                {paidSelected.length === 1 ? ' is' : 's are'} on a paid plan and
                will be skipped.
              </span>
            </p>
          )}

          {overCap && (
            <p className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                Maximum {MAX_TRIAL_GRANT_USERS} users per action —{' '}
                {selected.length} selected. Do the first{' '}
                {MAX_TRIAL_GRANT_USERS}, then select the next batch.
              </span>
            </p>
          )}

          <label className="flex items-start gap-3 rounded-md border border-gray-200 px-3 py-3 cursor-pointer hover:bg-gray-50">
            <Checkbox
              checked={resetQuota}
              onCheckedChange={(v) => setResetQuota(v === true)}
              className="mt-0.5"
            />
            <span className="text-sm">
              <span className="font-medium text-slate-800">
                Also reset plan usage to 0
              </span>
              <span className="block text-xs text-muted-foreground mt-0.5">
                Selected users get their full workout and meal plan allowance
                back (0/3 each).
              </span>
            </span>
          </label>
        </div>

        <DialogFooter className="pt-4">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!daysValid || overCap || isPending || !selected.length}
          >
            {isPending
              ? 'Applying…'
              : `Extend ${selected.length} user${selected.length === 1 ? '' : 's'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
