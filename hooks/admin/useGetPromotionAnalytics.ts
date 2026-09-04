import { useQuery } from '@tanstack/react-query';
import { apiJson } from '@/lib/api/client';
import type { PromotionAnalytics } from '@/lib/types';

export function useGetPromotionAnalytics(id: number | null) {
  return useQuery<PromotionAnalytics>({
    queryKey: ['admin-promotion-analytics', id],
    enabled: id !== null && Number.isFinite(id),
    queryFn: () =>
      apiJson<PromotionAnalytics>(
        `/admin/promotions/${id}/analytics`,
        {},
        'Failed to fetch promotion analytics'
      ),
  });
}
