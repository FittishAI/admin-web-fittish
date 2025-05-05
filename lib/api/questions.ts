import { API_URL } from "@/constants";
import { Question } from "../types";

export async function fetchQuestions(categoryId: number): Promise<Question[]> {
  const res = await fetch(`${API_URL}/questions?categoryId=${categoryId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch questions");
  return res.json();
}
