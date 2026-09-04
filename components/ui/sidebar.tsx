'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Home, List, Users, Coins, AlertTriangle, CalendarClock, Ticket, BarChart3 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/lib/store/authSlice';

function BrandImage({
  src,
  alt,
  width,
  height,
  className,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <span className={`relative inline-block shrink-0 ${className}`}>
      {!loaded && <Skeleton className="absolute inset-0 rounded-md" />}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-contain transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'
          }`}
      />
    </span>
  );
}

const mainNav = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Questionnaires', href: '/dashboard/questionnaires', icon: List },
  { label: 'Users', href: '/dashboard/users', icon: Users },
  { label: 'Free Trials', href: '/dashboard/free-trials', icon: CalendarClock },
  { label: 'Promo Codes', href: '/dashboard/promo-codes', icon: Ticket },
  { label: 'Promo Analytics', href: '/dashboard/promo-analytics', icon: BarChart3 },
  { label: 'Token Usage', href: '/dashboard/token-usage', icon: Coins },
  { label: 'Plan Failures', href: '/dashboard/plan-generations', icon: AlertTriangle },
];

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="md:flex h-screen w-64 flex-col justify-between border-r bg-white px-4 py-6 font-sans text-sm font-medium">
      {/* Top */}
      <div>
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 mb-8">
          {/* Compact official lockup, "Admin Panel" vertically centered beside it. */}
          <BrandImage
            src="/logo-lockup.png"
            alt="FITTISH.AI — Fitness & Nutrition"
            width={78}
            height={49}
            className="h-8 w-[51px]"
          />
          <h1 className="text-base font-bold text-slate-900 whitespace-nowrap">
            Admin Panel
          </h1>
        </div>

        {/* Main Nav */}
        <nav className="space-y-2 mb-6">
          <p className="text-xs text-muted-foreground px-2 mb-1">Main</p>
          {mainNav.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-gray-100 text-gray-700"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="mt-6 border-t pt-4 px-2">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-xs font-semibold">
              {(user?.email?.[0] ?? '?').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span
              className="font-medium truncate"
              title={user?.email ?? undefined}
            >
              {user?.email ?? '—'}
            </span>
            <span className="text-xs text-muted-foreground">
              {user?.role ?? '—'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
