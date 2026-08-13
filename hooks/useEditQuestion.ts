import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";

interface EditQuestionPayload {
  id: number;
  categoryId: string;
  questionText: string;
  questionType: string;
  userLevel: string;
  dependencyQuestion: boolean;
  isRequired: boolean;
  isActive: boolean;
  isStartingQuestion: boolean;
  options: { optionText: string }[];
}

const editQuestion = (data: EditQuestionPayload) =>
  apiJson<unknown>("/questions/edit", { method: "POST", json: data }, "Failed to update question");

export function useEditQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });
}
