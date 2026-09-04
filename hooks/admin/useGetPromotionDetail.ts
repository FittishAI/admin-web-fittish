import { useQuery } from '@tanstack/react-query';
import { apiJson } from '@/lib/api/client';
import type { PromotionDetail } from '@/lib/types';

export function useGetPromotionDetail(id: number | null) {
  return useQuery<PromotionDetail>({
    queryKey: ['admin-promotion', id],
    enabled: id !== null && Number.isFinite(id),
    queryFn: () =>
      apiJson<PromotionDetail>(
        `/admin/promotions/${id}`,
        {},
        'Failed to fetch the promotion'
      ),
  });
}
