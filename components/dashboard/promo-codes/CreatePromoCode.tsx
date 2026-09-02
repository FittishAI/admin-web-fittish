'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeftCircle, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCreatePromotion } from '@/hooks/admin/useCreatePromotion';
import { downloadFile, filenameSlug } from '@/lib/csv';
import {
  combineDateTime,
  localInputToIso,
  nowForTimeInput,
  todayForInput,
} from '@/lib/format';
import { DIGITS_ONLY, newRequestId } from '@/lib/utils';
import {
  CUSTOM_CODE_PATTERN,
  MAX_CUSTOM_REDEMPTIONS,
  MAX_ONE_TIME_CODES,
  MAX_PROMO_DAYS,
  PRODUCT_TYPE_LABELS,
  SELECTABLE_PRODUCT_TYPES,
} from '@/constants/promo';
import { formatDays } from '@/lib/format';
import type {
  CreatePromotionPayload,
  PromoProductType,
  PromotionType,
} from '@/lib/types';

export default function CreatePromoCode() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [type, setType] = useState<PromotionType>('CUSTOM');
  const [durationDays, setDurationDays] = useState('30');
  const [productType, setProductType] = useState<PromoProductType>('MONTHLY');
  const [code, setCode] = useState('');
  const [maxRedemptions, setMaxRedemptions] = useState('100');
  const [codeCount, setCodeCount] = useState('100');
  const [startDate, setStartDate] = useState(todayForInput);
  const [startTime, setStartTime] = useState(nowForTimeInput);
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('23:59');

  const { mutate: createPromotion, isPending } = useCreatePromotion();

  const requestIdRef = useRef<{ forPayload: string; id: string } | null>(null);
  const submittingRef = useRef(false);

  const startAt = combineDateTime(startDate, startTime);
  const endAt = combineDateTime(endDate, endTime);

  const startIso = localInputToIso(startAt);
  const endIso = localInputToIso(endAt);

  const nameValid = name.trim().length >= 3 && name.trim().length <= 100;
  const codeValid = CUSTOM_CODE_PATTERN.test(code.trim());
  const maxRedemptionsNum = Number(maxRedemptions);
  const maxRedemptionsValid =
    DIGITS_ONLY.test(maxRedemptions) &&
    maxRedemptions !== '' &&
    maxRedemptionsNum >= 1 &&
    maxRedemptionsNum <= MAX_CUSTOM_REDEMPTIONS;
  const durationDaysNum = Number(durationDays);
  const durationValid =
    DIGITS_ONLY.test(durationDays) &&
    durationDays !== '' &&
    durationDaysNum >= 1 &&
    durationDaysNum <= MAX_PROMO_DAYS;

  const codeCountNum = Number(codeCount);
  const codeCountValid =
    DIGITS_ONLY.test(codeCount) &&
    codeCount !== '' &&
    codeCountNum >= 1 &&
    codeCountNum <= MAX_ONE_TIME_CODES;

  const windowValid =
    !!startIso &&
    !!endIso &&
    new Date(endIso).getTime() > new Date(startIso).getTime() &&
    new Date(endIso).getTime() > Date.now();

  const typeValid =
    type === 'CUSTOM' ? codeValid && maxRedemptionsValid : codeCountValid;

  const canSubmit =
    nameValid && typeValid && durationValid && windowValid && !isPending;

  const payload = useMemo((): CreatePromotionPayload | null => {
    if (!startIso || !endIso) return null;
    return {
      name: name.trim(),
      type,
      durationDays: durationDaysNum,
      productType,
      startAt: startIso,
      endAt: endIso,
      ...(type === 'CUSTOM'
        ? { code: code.trim().toUpperCase(), maxRedemptions: maxRedemptionsNum }
        : { codeCount: codeCountNum }),
      requestId: '',
    };
  }, [
    name,
    type,
    durationDaysNum,
    productType,
    startIso,
    endIso,
    code,
    maxRedemptionsNum,
    codeCountNum,
  ]);

  const payloadFingerprint = useMemo(
    () => JSON.stringify(payload),
    [payload]
  );

  const handleSubmit = () => {
    if (!payload || submittingRef.current) return;
    if (!canSubmit) {
      toast.error('Please fix the highlighted fields before creating.');
      return;
    }
    submittingRef.current = true;

    if (requestIdRef.current?.forPayload !== payloadFingerprint) {
      requestIdRef.current = {
        forPayload: payloadFingerprint,
        id: newRequestId(),
      };
    }

    createPromotion(
      { ...payload, requestId: requestIdRef.current.id },
      {
        onSuccess: async (res) => {
          submittingRef.current = false;

          if (res.replayed) {
            toast.warning('Warning', {
              description:
                'This promotion had already been created — nothing was created ' +
                'a second time.',
            });
          } else {
            toast.success('Success', {
              description:
                res.type === 'ONE_TIME'
                  ? `${res.name} created with ${res.codesCount} codes.`
                  : `${res.name} created.`,
            });
          }

          if (res.type === 'ONE_TIME' && !res.replayed) {
            try {
              await downloadFile(
                `/admin/promotions/${res.id}/codes.csv`,
                `${filenameSlug(res.name)}-codes.csv`
              );
            } catch {
              toast.warning('Warning', {
                description:
                  'The promotion was created, but the codes CSV did not ' +
                  'download. Use the download button on the promotion page.',
              });
            }
          }

          requestIdRef.current = null;
          router.push(`/dashboard/promo-codes/${res.id}`);
        },
        onError: (err: Error) => {
          submittingRef.current = false;
          toast.error(err.message || 'Could not create the promotion.');
        },
      }
    );
  };

  return (
    <div className="max-w-5xl w-full mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeftCircle className="h-5 w-5 text-muted-foreground" />
        </Button>
        <h1 className="text-3xl font-semibold text-slate-800">
          Create Promo Code
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Promotion details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="promo-name">Promotion name</Label>
            <Input
              id="promo-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Reddit launch — 30 days free"
            />
            <p className="text-xs text-muted-foreground">
              Internal only — users never see this. 3–100 characters.
            </p>
          </div>

          <div className="space-y-3">
            <Label>Promotion type</Label>
            <RadioGroup
              value={type}
              onValueChange={(v) => setType(v as PromotionType)}
              className="gap-3"
            >
              <label
                htmlFor="type-custom"
                className="flex items-start gap-3 rounded-md border border-gray-200 px-3 py-3 cursor-pointer hover:bg-gray-50"
              >
                <RadioGroupItem value="CUSTOM" id="type-custom" className="mt-0.5" />
                <span className="text-sm">
                  <span className="font-medium text-slate-800">
                    Custom code
                  </span>
                  <span className="block text-xs text-muted-foreground mt-0.5">
                    A single code like REDDIT30 that many people can redeem, up
                    to a limit you set. Best for public campaigns.
                  </span>
                </span>
              </label>
              <label
                htmlFor="type-onetime"
                className="flex items-start gap-3 rounded-md border border-gray-200 px-3 py-3 cursor-pointer hover:bg-gray-50"
              >
                <RadioGroupItem value="ONE_TIME" id="type-onetime" className="mt-0.5" />
                <span className="text-sm">
                  <span className="font-medium text-slate-800">
                    One-time codes
                  </span>
                  <span className="block text-xs text-muted-foreground mt-0.5">
                    A batch of generated codes, each usable once. Best for
                    influencers, support credits, or anything you hand out
                    individually.
                  </span>
                </span>
              </label>
            </RadioGroup>
          </div>

          {type === 'CUSTOM' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="promo-code">Code</Label>
                <Input
                  id="promo-code"
                  value={code}
                  autoComplete="off"
                  spellCheck={false}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="REDDIT30"
                  className="font-mono tracking-wide"
                />
                <p className="text-xs text-muted-foreground">
                  Letters and numbers only, 4–24 characters. No spaces or
                  hyphens.
                </p>
                {code && !codeValid && (
                  <p className="text-xs text-red-600">
                    Use only A–Z and 0–9, 4–24 characters.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-limit">How many people can use it?</Label>
                <Input
                  id="promo-limit"
                  inputMode="numeric"
                  value={maxRedemptions}
                  onChange={(e) => {
                    if (DIGITS_ONLY.test(e.target.value)) {
                      setMaxRedemptions(e.target.value);
                    }
                  }}
                  placeholder="100"
                />
                <p className="text-xs text-muted-foreground">
                  1–{MAX_CUSTOM_REDEMPTIONS.toLocaleString()}. Once this many
                  people redeem it, the code stops working.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 max-w-xs">
              <Label htmlFor="promo-count">Number of codes</Label>
              <Input
                id="promo-count"
                inputMode="numeric"
                value={codeCount}
                onChange={(e) => {
                  if (DIGITS_ONLY.test(e.target.value)) {
                    setCodeCount(e.target.value);
                  }
                }}
                placeholder="100"
              />
              <p className="text-xs text-muted-foreground">
                1–{MAX_ONE_TIME_CODES.toLocaleString()}. You will get a CSV of
                every code as soon as the promotion is created.
              </p>
            </div>
          )}

          <div className="space-y-2 max-w-xs">
            <Label htmlFor="promo-duration">How much premium do they get?</Label>
            <div className="flex items-center gap-2">
              <Input
                id="promo-duration"
                inputMode="numeric"
                value={durationDays}
                onChange={(e) => {
                  if (DIGITS_ONLY.test(e.target.value)) {
                    setDurationDays(e.target.value);
                  }
                }}
                placeholder="30"
                className="w-[120px]"
              />
              <span className="text-sm text-muted-foreground">days</span>
            </div>
            <p className="text-xs text-muted-foreground">
              1–{MAX_PROMO_DAYS.toLocaleString()} days. Counted from the moment
              the code is redeemed, not from the start date.
            </p>
            {durationDays && !durationValid && (
              <p className="text-xs text-red-600">
                Enter a whole number of days between 1 and{' '}
                {MAX_PROMO_DAYS.toLocaleString()}.
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Product type</Label>
            <RadioGroup
              value={productType}
              onValueChange={(v) => setProductType(v as PromoProductType)}
              className="flex flex-row flex-wrap gap-6"
            >
              {SELECTABLE_PRODUCT_TYPES.map((t) => (
                <label
                  key={t}
                  htmlFor={`product-type-${t}`}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <RadioGroupItem value={t} id={`product-type-${t}`} />
                  <span className="text-sm font-medium text-slate-800">
                    {PRODUCT_TYPE_LABELS[t]}
                  </span>
                </label>
              ))}
            </RadioGroup>
            <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Info className="w-3.5 h-3.5 mt-px shrink-0" />
              The redeemer gets the plan usage allowance of the type you pick
              here, for as long as the promotion lasts.
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="promo-start-date">Start date and time</Label>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
                <Input
                  id="promo-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full sm:w-[190px]"
                />
                <Input
                  id="promo-start-time"
                  type="time"
                  aria-label="Start time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full sm:w-[140px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="promo-end-date">End date and time</Label>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
                <Input
                  id="promo-end-date"
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full sm:w-[190px]"
                />
                <Input
                  id="promo-end-time"
                  type="time"
                  aria-label="End time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full sm:w-[140px]"
                />
              </div>
              {endIso && startIso && !windowValid && (
                <p className="text-xs text-red-600">
                  The end date and time must be after the start, and in the
                  future.
                </p>
              )}
            </div>
          </div>

          <p className="flex items-start gap-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              This window controls <strong>when the code can be redeemed</strong>,
              not how long premium lasts. Someone redeeming one second before it
              closes still gets the full{' '}
              {durationValid ? formatDays(durationDaysNum) : 'duration'}.
            </span>
          </p>

          <p className="text-xs text-muted-foreground">
            The window cannot be changed after creation. To alter it, deactivate
            this promotion and create a new one.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {isPending ? 'Creating…' : 'Create promotion'}
        </Button>
      </div>
    </div>
  );
}
