import { useQuery } from '@tanstack/react-query';
import { apiJson } from '@/lib/api/client';

export function useGetAllUsers() {
  return useQuery({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: () => apiJson<any>('/admin/users', {}, 'Failed to fetch users'),
    queryKey: ['admin-users'],
  });
}
