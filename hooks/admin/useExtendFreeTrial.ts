import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiJson } from '@/lib/api/client';
import type { ExtendTrialPayload, ExtendTrialResult } from '@/lib/types';

export function useExtendFreeTrial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ExtendTrialPayload) =>
      apiJson<ExtendTrialResult>(
        '/admin/free-trial/grants',
        { method: 'POST', json: payload },
        'Failed to extend free trial'
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}
