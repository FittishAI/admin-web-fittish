'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings } from 'lucide-react';
import Link from 'next/link';

const profile = {
  name: 'Fittish Admin',
  email: 'admin@fittish.com',
  role: 'Administrator',
  joined: 'Sep 12, 2023',
  avatar: '',
};

export default function YourProfileCard() {
  return (
    <div className="mb-8">
      <h2 className="text-base font-semibold text-slate-700 mb-4">Your Profile</h2>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback>
              {profile.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <p className="font-medium text-slate-800">{profile.name}</p>
            <p className="text-sm text-gray-500">{profile.email}</p>
            <p className="text-xs text-gray-400 mt-1">Role: {profile.role}</p>
            <p className="text-xs text-gray-400">Joined: {profile.joined}</p>
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
