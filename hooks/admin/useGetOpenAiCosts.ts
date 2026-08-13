import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiJson } from '@/lib/api/client';
import { OpenAiCostsResult } from '@/lib/types';

export interface OpenAiCostsFilters {
  /** Local calendar date `YYYY-MM-DD`; the API reads it as a whole UTC day. */
  from?: string;
  to?: string;
  groupByLineItem?: boolean;
  groupByProject?: boolean;
}

export function useGetOpenAiCosts(
  filters: OpenAiCostsFilters = {},
  enabled = true
) {
  return useQuery<OpenAiCostsResult>({
    queryKey: ['admin-openai-costs', filters],
    enabled,
    placeholderData: keepPreviousData,
    // OpenAI aggregates billing on a delay, so refetching aggressively spends
    // rate limit on data that cannot have changed.
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.from) params.set('from', filters.from);
      if (filters.to) params.set('to', filters.to);
      if (filters.groupByLineItem) params.set('groupByLineItem', 'true');
      if (filters.groupByProject) params.set('groupByProject', 'true');

      const query = params.toString();
      return apiJson<OpenAiCostsResult>(
        `/admin/openai-costs${query ? `?${query}` : ''}`,
        {},
        'Failed to fetch OpenAI costs'
      );
    },
  });
}
