import { API_URL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const deleteQuestion = async (id: number) => {
  const res = await fetch(`${API_URL}/questions`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });

  if (!res.ok) {
    const errorBody = await res.json();
    throw new Error(errorBody.message || "Failed to delete question");
  }

  return true;
};

export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });
}
