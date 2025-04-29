'use client';

import Link from 'next/link';
import { Home, List, Users, Star, Clock, Settings } from 'lucide-react';
import FittishLogo from '@/assets/icons/FittishLogo';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const mainNav = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Questionnaires', href: '/dashboard/questionnaires', icon: List },
  { label: 'Users', href: '/dashboard/users', icon: Users },
];

const workspaceNav = [
  // { label: 'Starred', href: '/dashboard/starred', icon: Star },
  { label: 'History', href: '/dashboard/history', icon: Clock },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="md:flex h-screen w-64 flex-col justify-between border-r bg-white px-4 py-6 font-sans text-sm font-medium">
      {/* Top */}
      <div>
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <FittishLogo width={24} height={24} />
          <span className="text-lg font-bold tracking-tight">Fittish Admin</span>
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

        {/* Workspace */}
        <nav className="space-y-2">
          <p className="text-xs text-muted-foreground px-2 mb-1">Workspace</p>
          {workspaceNav.map(({ label, href, icon: Icon }) => (
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
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback><FittishLogo width={24} height={24} /></AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">admin@fittish.com</span>
            <span className="text-xs text-muted-foreground">Admin</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
