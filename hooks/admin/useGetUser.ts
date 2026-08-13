import { useQuery } from '@tanstack/react-query';
import { apiJson } from '@/lib/api/client';

export function useGetUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    // `any` preserves the previous `res.json()` contract — see useGetAllUsers.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: () => apiJson<any>(`/admin/users/${id}`, {}, 'Failed to fetch user'),
    enabled: !!id,
  });
}
