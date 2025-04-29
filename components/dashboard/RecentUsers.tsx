'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

const users = [
  {
    name: 'Sana Qureshi',
    email: 'sana@fittish.com',
    joined: 'Oct 20, 2023',
    avatar: '',
  },
  {
    name: 'Adnan Riaz',
    email: 'adnan@fittish.com',
    joined: 'Oct 25, 2023',
    avatar: '',
  },
  {
    name: 'Sajid Mehmood',
    email: 'sajid@fittish.com',
    joined: 'Oct 27, 2023',
    avatar: '',
  },
];

export default function RecentUsers() {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-700">Recent Users</h2>
        <Link href="/dashboard/users">
          <button className="text-sm px-3 py-1.5 bg-black text-white rounded-md">View All</button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <Card key={user.email}>
            <CardContent className="p-4 flex items-center gap-4">
              <Avatar>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-slate-800">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-400 mt-1">Joined: {user.joined}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
