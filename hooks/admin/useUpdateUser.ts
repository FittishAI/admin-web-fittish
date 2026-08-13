import { useMutation } from '@tanstack/react-query';
import { apiJson } from '@/lib/api/client';

export const useUpdateUser = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      apiJson<unknown>(
        `/admin/users/${id}`,
        { method: 'POST', json: data },
        'Failed to update user'
      ),
  });
};
