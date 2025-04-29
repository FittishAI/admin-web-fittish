// Questionnaire Types

export type QuestionType = 
  | "multipleChoice" 
  | "text" 
  | "number" 
  | "boolean" 
  | "scale";

export interface Option {
  id: string;
  value: string;
  label: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  options?: Option[];
  order: number;
  description?: string;
}

export interface Questionnaire {
  id: string;
  title: string;
  description: string;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
  questions: Question[];
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  avatar?: string;
  createdAt: string;
}