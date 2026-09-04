import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiJson } from '@/lib/api/client';
import type { CreatePromotionPayload, CreatePromotionResult } from '@/lib/types';

export function useCreatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePromotionPayload) =>
      apiJson<CreatePromotionResult>(
        '/admin/promotions',
        { method: 'POST', json: payload },
        'Failed to create the promotion'
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
    },
  });
}
