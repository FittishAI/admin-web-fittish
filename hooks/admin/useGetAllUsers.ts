import { useQuery } from '@tanstack/react-query';
import { API_URL } from '@/constants';

export function useGetAllUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/admin/users`);
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
  });
}
