"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "../store/authSlice";
import { Skeleton } from "@/components/ui/skeleton";

const publicRoutes = ["/", "/login"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const isPublic = publicRoutes.includes(pathname);
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isPublic && (!token || !isAdmin)) {
      router.replace("/login");
      return;
    }

    if (token && isAdmin && pathname === "/login") {
      router.replace("/dashboard");
    }
  }, [hasHydrated, token, isAdmin, isPublic, pathname, router]);

  if (!hasHydrated) return <Skeleton />;

  if (!isPublic && (!token || !isAdmin)) return <Skeleton />;

  return <>{children}</>;
}
