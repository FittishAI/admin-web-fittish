import { API_URL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateQuestionPayload {
  categoryId: string;
  questionText: string;
  questionType: string;
  userLevel: string;
  dependencyQuestion: boolean;
  isRequired: boolean;
  isActive: boolean;
  isStartingQuestion: boolean;
  options: { optionText: string }[];
  nextQuestion?: {
    questionText: string;
    questionType: string;
    required: boolean;
    status: "draft" | "published";
    questionOrder?: number;
    description?: string;
    options?: {
      optionText: string;
      optionOrder?: number;
      nextQuestionId?: number;
    }[];
  };
}

const createQuestion = async (data: CreateQuestionPayload) => {
  const res = await fetch(`${API_URL}/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create question");
  }

  return res.json();
};

export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });
}
