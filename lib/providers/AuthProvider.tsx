"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "../store/authSlice";
import { Skeleton } from "@/components/ui/skeleton";

const publicRoutes = ["/", "/auth/login"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const isPublic = publicRoutes.includes(pathname);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!token && !isPublic) {
      router.replace("/auth/login");
    }

    if (token && pathname === "/auth/login") {
      router.replace("/dashboard");
    }
  }, [hasHydrated, token, pathname]);

  if (!hasHydrated) return <Skeleton />;

  return <>{children}</>;
}
