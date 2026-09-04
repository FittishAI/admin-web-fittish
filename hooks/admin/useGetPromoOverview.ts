import { useQuery } from '@tanstack/react-query';
import { apiJson } from '@/lib/api/client';
import type { PromoOverview } from '@/lib/types';


export function useGetPromoOverview(range: string) {
  return useQuery<PromoOverview>({
    queryKey: ['admin-promo-overview', range],
    queryFn: () =>
      apiJson<PromoOverview>(
        `/admin/promotions/overview?range=${encodeURIComponent(range)}`,
        {},
        'Failed to fetch promo analytics'
      ),
  });
}
