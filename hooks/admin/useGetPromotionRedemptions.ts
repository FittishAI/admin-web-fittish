import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiJson } from '@/lib/api/client';
import type {
  PromotionRedemptionFilters,
  PromotionRedemptionsPage,
} from '@/lib/types';

export function useGetPromotionRedemptions(
  id: number | null,
  filters: PromotionRedemptionFilters
) {
  return useQuery<PromotionRedemptionsPage>({
    queryKey: ['admin-promotion-redemptions', id, filters],
    enabled: id !== null && Number.isFinite(id),
    placeholderData: keepPreviousData,
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('offset', String(filters.offset));
      params.set('limit', String(filters.limit));
      if (filters.status && filters.status !== 'ALL') {
        params.set('status', filters.status);
      }

      return apiJson<PromotionRedemptionsPage>(
        `/admin/promotions/${id}/redemptions?${params.toString()}`,
        {},
        'Failed to fetch redemptions'
      );
    },
  });
}
