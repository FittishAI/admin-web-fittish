// Questionnaire Types

export type QuestionType = 
  | "multipleChoice" 
  | "text" 
  | "number" 
  | "boolean" 
  | "scale";

export interface Option {
  id: number;
  optionText: string;
  optionOrder?: number;
  nextQuestionId?: number;
}  

export interface Question {
  id: number;
  categoryId: Category;
  questionText: string;
  questionType: QuestionType;
  userLevel: UserLevel;
  dependencyQuestion: boolean;
  isRequired: boolean;
  isStartingQuestion: boolean;
  isActive: boolean;
  questionOrder?: number;
  defaultNextQuestionId?: number;
  options?: Option[];
  nextQuestion?: {
    id: number;
  };
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

export type UserLevel = "beginer" | "intermediate" | "advance";
export type Category = "BASIC" | "MEAL" | "WORKOUT";
export type QuestionStatus = "Active" | "Inactive";

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  avatar?: string;
  createdAt: string;
}