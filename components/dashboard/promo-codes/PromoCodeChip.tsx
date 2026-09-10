'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';

const COPIED_FEEDBACK_MS = 1500;

export default function PromoCodeChip({
  code,
  boxed = false,
  className,
}: {
  code: string;
  boxed?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    } catch {
      toast.error('Could not copy — select the code and copy it manually.');
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5',
        boxed && 'h-9 w-full rounded-md border border-input px-3 shadow-xs',
        className,
      )}
    >
      <code className="select-all font-mono text-sm font-semibold tracking-wider text-slate-800">
        {code}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Code copied' : `Copy code ${code}`}
        title="Copy code"
        className="rounded p-1 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-slate-700"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-600" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </span>
  );
}
