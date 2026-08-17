import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiJson } from '@/lib/api/client';
import { AdminUsersPage } from '@/lib/types';

export interface AdminUsersFilters {
  offset: number;
  limit: number;
  search?: string;
}

export function useGetAllUsers(filters: AdminUsersFilters) {
  return useQuery<AdminUsersPage>({
    queryKey: ['admin-users', filters],
    placeholderData: keepPreviousData,
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('offset', String(filters.offset));
      params.set('limit', String(filters.limit));
      if (filters.search) params.set('search', filters.search);

      return apiJson<AdminUsersPage>(
        `/admin/users?${params.toString()}`,
        {},
        'Failed to fetch users'
      );
    },
  });
}
