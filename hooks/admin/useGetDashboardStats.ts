import { useQuery } from '@tanstack/react-query';
import { apiJson } from '@/lib/api/client';
import { DashboardStats } from '@/lib/types';

export function useGetDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['admin-dashboard-stats'],
    staleTime: 60 * 1000,
    queryFn: () =>
      apiJson<DashboardStats>(
        '/admin/dashboard-stats',
        {},
        'Failed to load dashboard stats'
      ),
  });
}
