import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiJson } from '@/lib/api/client';

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiJson<void>(`/admin/users/${id}`, { method: 'DELETE' }, 'Failed to delete user'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}
