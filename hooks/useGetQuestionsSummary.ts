import { useQuery } from '@tanstack/react-query';
import { apiJson } from '@/lib/api/client';

export interface QuestionCategorySummary {
  category: 'BASIC' | 'MEAL' | 'WORKOUT';
  questionCount: number;
  activeCount: number;
  lastUpdatedAt: string | null;
}

export function useGetQuestionsSummary() {
  return useQuery<QuestionCategorySummary[]>({
    queryKey: ['admin-questions-summary'],
    staleTime: 60 * 1000,
    queryFn: () =>
      apiJson<QuestionCategorySummary[]>(
        '/admin/questions-summary',
        {},
        'Failed to load question counts'
      ),
  });
}
