import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";

const deleteQuestion = async (id: number) => {
  await apiJson<void>("/questions", { method: "DELETE", json: { id } }, "Failed to delete question");
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
