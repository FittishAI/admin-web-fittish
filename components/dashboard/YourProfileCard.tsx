'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authSlice';

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function YourProfileCard() {
  const user = useAuthStore((s) => s.user);

  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || 'Admin';
  const email = user?.email ?? '—';
  const role = user?.role ?? '—';

  return (
    <div className="mb-8">
      <h2 className="text-base font-semibold text-slate-700 mb-4">Your Profile</h2>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.imageUrl ?? ''} alt={name} />
            <AvatarFallback>{initialsOf(name)}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <p className="font-medium text-slate-800">{name}</p>
            <p className="text-sm text-gray-500">{email}</p>
            <p className="text-xs text-gray-400 mt-1">Role: {role}</p>
          </div>

          <Link href="/dashboard/settings">
            <button className="text-sm px-3 py-1.5 border rounded-md flex items-center gap-1 hover:bg-gray-50">
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
