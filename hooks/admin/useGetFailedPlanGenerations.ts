import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiJson } from '@/lib/api/client';
import {
  FailedPlanGenerationFilters,
  FailedPlanGenerationsPage,
} from '@/lib/types';

export function useGetFailedPlanGenerations(
  filters: FailedPlanGenerationFilters
) {
  return useQuery<FailedPlanGenerationsPage>({
    queryKey: ['admin-plan-generations', filters],
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('offset', String(filters.offset));
      params.set('limit', String(filters.limit));
      if (filters.search) params.set('search', filters.search);

      return apiJson<FailedPlanGenerationsPage>(
        `/admin/plan-generations?${params.toString()}`,
        {},
        'Failed to fetch plan generation failures'
      );
    },
  });
}
