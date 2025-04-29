import { type StateCreator } from 'zustand';
import { Questionnaire } from '@/lib/types';

export interface QuestionnaireSlice {
  questionnaires: Questionnaire[];
  setQuestionnaires: (questionnaires: Questionnaire[]) => void;
}

export const createQuestionnaireSlice: StateCreator<QuestionnaireSlice> = (set) => ({
  questionnaires: [],
  setQuestionnaires: (questionnaires) => set({ questionnaires }),
});