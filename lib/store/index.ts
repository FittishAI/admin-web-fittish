import { create } from 'zustand';
import { createUserSlice, type UserSlice } from './user-slice';
import { createQuestionnaireSlice, type QuestionnaireSlice } from './questionnaire-slice';

type StoreState = UserSlice & QuestionnaireSlice;

export const useStore = create<StoreState>()((...args) => ({
  ...createUserSlice(...args),
  ...createQuestionnaireSlice(...args),
}));