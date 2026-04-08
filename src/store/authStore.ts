import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';
import { UserRepository } from '../database/UserRepository';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  login: (email: string, passwordPlain: string) => Promise<{ success: boolean; error?: string }>;
  signup: (fullName: string, email: string, passwordPlain: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  clearError: () => void;
  syncProfile: () => Promise<void>;
  updateProfile: (fullName: string, email: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (email, passwordPlain) => {
        set({ loading: true, error: null });
        try {
          const user = await UserRepository.authenticate(email, passwordPlain);
          set({ user, isAuthenticated: true, loading: false });
          return { success: true };
        } catch (err: any) {
          let message = 'An unexpected error occurred.';
          if (err.message === 'USER_NOT_FOUND') message = 'No account found with this email.';
          else if (err.message === 'INVALID_PASSWORD') message = 'Incorrect password. Please try again.';
          set({ error: message, loading: false });
          return { success: false, error: message };
        }
      },

      signup: async (fullName, email, passwordPlain) => {
        set({ loading: true, error: null });
        try {
          const user = await UserRepository.createUser(fullName, email, passwordPlain);
          set({ user, isAuthenticated: true, loading: false });
          return { success: true };
        } catch (err: any) {
          let message = 'An unexpected error occurred.';
          if (err.message === 'EMAIL_EXISTS') message = 'This email is already registered.';
          set({ error: message, loading: false });
          return { success: false, error: message };
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, error: null });
      },

      clearError: () => {
        set({ error: null });
      },

      syncProfile: async () => {
        const { user } = get();
        if (!user) return;
        try {
          const updatedUser = await UserRepository.getProfile(user.id);
          if (updatedUser) set({ user: updatedUser });
        } catch (err) {
          console.error('Failed to sync profile:', err);
        }
      },

      updateProfile: async (fullName, email) => {
        const { user } = get();
        if (!user) return { success: false, error: 'Not authenticated.' };
        set({ loading: true });
        try {
          const updated = await UserRepository.updateProfile(user.id, fullName, email);
          set({ user: updated, loading: false });
          return { success: true };
        } catch (err: any) {
          let message = 'Failed to update profile.';
          if (err.message === 'EMAIL_EXISTS') message = 'This email is already taken by another account.';
          set({ loading: false });
          return { success: false, error: message };
        }
      },

      deleteAccount: async () => {
        const { user } = get();
        if (!user) return { success: false, error: 'Not authenticated.' };
        set({ loading: true });
        try {
          await UserRepository.deleteAccount(user.id);
          set({ user: null, isAuthenticated: false, loading: false, error: null });
          return { success: true };
        } catch (err: any) {
          set({ loading: false });
          return { success: false, error: 'Failed to delete account.' };
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
