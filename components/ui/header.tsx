'use client';

import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/authSlice";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
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
          Dashboard
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
