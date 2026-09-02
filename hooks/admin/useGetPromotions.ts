import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiJson } from '@/lib/api/client';
import type { PromotionFilters, PromotionsPage } from '@/lib/types';

export function useGetPromotions(filters: PromotionFilters) {
  return useQuery<PromotionsPage>({
    queryKey: ['admin-promotions', filters],
    placeholderData: keepPreviousData,
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('offset', String(filters.offset));
      params.set('limit', String(filters.limit));
      if (filters.search) params.set('search', filters.search);
      if (filters.status && filters.status !== 'ALL') {
        params.set('status', filters.status);
      }

      return apiJson<PromotionsPage>(
        `/admin/promotions?${params.toString()}`,
        {},
        'Failed to fetch promotions'
      );
    },
  });
}
