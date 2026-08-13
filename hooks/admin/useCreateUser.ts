import { useMutation } from '@tanstack/react-query';
import { apiJson } from '@/lib/api/client';

export const useCreateUser = () => {
  return useMutation({
    mutationFn: (data: unknown) =>
      apiJson<unknown>('/admin/users', { method: 'POST', json: data }, 'Failed to create user'),
  });
};
