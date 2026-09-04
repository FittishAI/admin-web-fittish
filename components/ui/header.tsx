'use client';

import { Menu, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/authSlice";

const PAGE_TITLES: Array<[string, string]> = [
  ["/dashboard/promo-analytics", "Promo Analytics"],
  ["/dashboard/promo-codes/create", "Create Promo Code"],
  ["/dashboard/promo-codes", "Promo Codes"],
  ["/dashboard/questionnaires", "Questionnaires"],
  ["/dashboard/free-trials", "Free Trials"],
  ["/dashboard/token-usage", "Token Usage"],
  ["/dashboard/plan-generations", "Plan Failures"],
  ["/dashboard/users", "Users"],
  ["/dashboard", "Dashboard"],
];

function titleFor(pathname: string | null): string {
  if (!pathname) return "Dashboard";
  return PAGE_TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? "Dashboard";
}

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const handleLogout = () => {
    logout();
  };

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* Menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Toggle menu"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold tracking-tight text-slate-700">
          {titleFor(pathname)}
        </h1>
      </div>

      {/* Logout */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="text-sm text-gray-600 hover:text-black flex items-center gap-1"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
    </header>
  );
}
