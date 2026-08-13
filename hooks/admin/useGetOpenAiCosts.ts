import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiJson } from '@/lib/api/client';
import { OpenAiCostsReconciliation } from '@/lib/types';

export interface OpenAiCostsFilters {
  from?: string;
  to?: string;
  groupByLineItem?: boolean;
}

export function useGetOpenAiCosts(filters: OpenAiCostsFilters = {}) {
  return useQuery<OpenAiCostsReconciliation>({
    queryKey: ['admin-openai-costs', filters],
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    retry: false,
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.from) params.set('from', filters.from);
      if (filters.to) params.set('to', filters.to);
      if (filters.groupByLineItem) params.set('groupByLineItem', 'true');

      const query = params.toString();
      return apiJson<OpenAiCostsReconciliation>(
        `/admin/openai-costs${query ? `?${query}` : ''}`,
        {},
        'Failed to fetch OpenAI costs'
      );
    },
  });
}
