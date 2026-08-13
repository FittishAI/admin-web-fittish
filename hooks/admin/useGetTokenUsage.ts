import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { API_URL } from '@/constants';
import { TokenUsageFilters, TokenUsageResponse } from '@/lib/types';


const startOfLocalDay = (date: string): string =>
  new Date(`${date}T00:00:00.000`).toISOString();

const endOfLocalDay = (date: string): string =>
  new Date(`${date}T23:59:59.999`).toISOString();

export function useGetTokenUsage(filters: TokenUsageFilters) {
  return useQuery<TokenUsageResponse>({
    queryKey: ['admin-token-usage', filters],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('offset', String(filters.offset));
      params.set('limit', String(filters.limit));
      if (filters.search) params.set('search', filters.search);
      if (filters.action) params.set('action', filters.action);
      if (filters.from) params.set('from', startOfLocalDay(filters.from));
      if (filters.to) params.set('to', endOfLocalDay(filters.to));

      const res = await fetch(`${API_URL}/admin/token-usage?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch token usage');
      return res.json();
    },
  });
}
