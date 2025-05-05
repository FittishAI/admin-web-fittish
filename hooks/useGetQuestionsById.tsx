import { API_URL } from "@/constants";
import { useQuery } from "@tanstack/react-query";

const fetchQuestionById = async (id: number) => {
  const res = await fetch(`${API_URL}/questions/view`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });

  if (!res.ok) {
    const errorBody = await res.json();
    throw new Error(errorBody.message || "Failed to fetch question");
  }

  return res.json();
};

export function useGetQuestionById(id: number) {
  return useQuery({
    queryKey: ["question", id],
    queryFn: () => fetchQuestionById(id),
    enabled: !!id,
  });
}
