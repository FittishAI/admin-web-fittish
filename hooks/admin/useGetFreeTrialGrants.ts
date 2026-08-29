import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiJson } from '@/lib/api/client';
import type { FreeTrialGrantFilters, FreeTrialGrantsPage } from '@/lib/types';

export function useGetFreeTrialGrants(filters: FreeTrialGrantFilters) {
  return useQuery<FreeTrialGrantsPage>({
    queryKey: ['admin-free-trial-grants', filters],
    placeholderData: keepPreviousData,
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('offset', String(filters.offset));
      params.set('limit', String(filters.limit));
      if (filters.search) params.set('search', filters.search);

      return apiJson<FreeTrialGrantsPage>(
        `/admin/free-trial/grants?${params.toString()}`,
        {},
        'Failed to fetch free trial grants'
      );
    },
  });
}
