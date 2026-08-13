import { apiJson } from "@/lib/api/client";
import { Question } from "../types";

export async function fetchQuestions(categoryId: number): Promise<Question[]> {
  // Auth header and 401/refresh handling come from the central client.
  return apiJson<Question[]>(
    `/questions?categoryId=${categoryId}`,
    {},
    "Failed to fetch questions"
  );
}
