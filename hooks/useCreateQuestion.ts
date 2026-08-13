import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";

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

const createQuestion = (data: CreateQuestionPayload) =>
  apiJson<unknown>("/questions", { method: "POST", json: data }, "Failed to create question");

export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });
}
