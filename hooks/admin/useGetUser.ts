import { useQuery } from '@tanstack/react-query';
import { API_URL } from '@/constants';

export function useGetUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/admin/users/${id}`);
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    },
    enabled: !!id,
  });
}
