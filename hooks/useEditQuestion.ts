import { API_URL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

const editQuestion = async (data: EditQuestionPayload) => {
  const res = await fetch(`${API_URL}/questions/edit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update question");
  }

  return res.json();
};

export function useEditQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });
}
