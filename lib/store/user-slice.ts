import { type StateCreator } from 'zustand';
import { User } from '@/lib/types';

export interface UserSlice {
  users: User[];
  currentUser: User | null;
  setUsers: (users: User[]) => void;
  setCurrentUser: (user: User | null) => void;
}

export const createUserSlice: StateCreator<UserSlice> = (set) => ({
  users: [],
  currentUser: null,
  setUsers: (users) => set({ users }),
  setCurrentUser: (user) => set({ currentUser: user }),
});