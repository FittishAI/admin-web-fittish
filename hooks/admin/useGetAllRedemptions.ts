import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiJson } from '@/lib/api/client';
import type {
  GlobalRedemptionFilters,
  GlobalRedemptionsPage,
} from '@/lib/types';

export function useGetAllRedemptions(filters: GlobalRedemptionFilters) {
  return useQuery<GlobalRedemptionsPage>({
    queryKey: ['admin-all-redemptions', filters],
    placeholderData: keepPreviousData,
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('offset', String(filters.offset));
      params.set('limit', String(filters.limit));
      if (filters.search) params.set('search', filters.search);
      if (filters.promotionId) {
        params.set('promotionId', String(filters.promotionId));
      }
      if (filters.status && filters.status !== 'ALL') {
        params.set('status', filters.status);
      }

      return apiJson<GlobalRedemptionsPage>(
        `/admin/promotions/redemptions?${params.toString()}`,
        {},
        'Failed to fetch redemptions'
      );
    },
  });
}
