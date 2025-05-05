import { useQuery } from "@tanstack/react-query";
import { fetchQuestions } from "@/lib/api/questions";

export function useGetQuestions(categoryId: number) {
  return useQuery({
    queryKey: ["questions", categoryId],
    queryFn: () => fetchQuestions(categoryId),
    enabled: !!categoryId,
  });
}
