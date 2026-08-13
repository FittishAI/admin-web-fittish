import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";

// `any` preserves the previous `res.json()` contract — see useGetAllUsers.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetchQuestionById = (id: number) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiJson<any>("/questions/view", { method: "POST", json: { id } }, "Failed to fetch question");

export function useGetQuestionById(id: number) {
  return useQuery({
    queryKey: ["question", id],
    queryFn: () => fetchQuestionById(id),
    enabled: !!id,
  });
}
