import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiJson } from '@/lib/api/client';
import type { PromotionDetail } from '@/lib/types';

export function useDeactivatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      apiJson<PromotionDetail>(
        `/admin/promotions/${id}/deactivate`,
        { method: 'POST' },
        'Failed to deactivate the promotion'
      ),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-promotion', id] });
    },
  });
}
