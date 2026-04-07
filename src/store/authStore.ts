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
  
  /**
   * Initialize or Login user locally.
   */
  login: (email: string, passwordPlain: string) => Promise<boolean>;
  
  /**
   * Register a new user locally.
   */
  signup: (fullName: string, email: string, passwordPlain: string) => Promise<boolean>;
  
  /**
   * Clear user session.
   */
  logout: () => void;
  
  /**
   * Update user metrics (balance, etc) from DB.
   */
  syncProfile: () => Promise<void>;
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
          if (user) {
            set({ user, isAuthenticated: true, loading: false });
            return true;
          } else {
            set({ error: 'Invalid email or password.', loading: false });
            return false;
          }
        } catch (err: any) {
          set({ error: err.message, loading: false });
          return false;
        }
      },

      signup: async (fullName, email, passwordPlain) => {
        set({ loading: true, error: null });
        try {
          const user = await UserRepository.createUser(fullName, email, passwordPlain);
          set({ user, isAuthenticated: true, loading: false });
          return true;
        } catch (err: any) {
          set({ error: err.message, loading: false });
          return false;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, error: null });
      },

      syncProfile: async () => {
        const { user } = get();
        if (!user) return;
        
        try {
          const updatedUser = await UserRepository.getProfile(user.id);
          if (updatedUser) {
            set({ user: updatedUser });
          }
        } catch (err) {
          console.error('Failed to sync profile:', err);
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
