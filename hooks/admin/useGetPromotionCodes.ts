import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiJson } from '@/lib/api/client';
import type { PromotionCodeFilters, PromotionCodesPage } from '@/lib/types';

export function useGetPromotionCodes(
  id: number | null,
  filters: PromotionCodeFilters,
  enabled: boolean
) {
  return useQuery<PromotionCodesPage>({
    queryKey: ['admin-promotion-codes', id, filters],
    enabled: enabled && id !== null && Number.isFinite(id),
    placeholderData: keepPreviousData,
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('offset', String(filters.offset));
      params.set('limit', String(filters.limit));
      if (filters.availability && filters.availability !== 'ALL') {
        params.set('availability', filters.availability);
      }

      return apiJson<PromotionCodesPage>(
        `/admin/promotions/${id}/codes?${params.toString()}`,
        {},
        'Failed to fetch codes'
      );
    },
  });
}
