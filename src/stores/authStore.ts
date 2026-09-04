import { create } from 'zustand';
import { User } from '../types/api.types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string, refreshToken?: string) => void;
  updateTokens: (token: string, refreshToken?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Load initial state from localStorage if available
  const storedUser = localStorage.getItem('rest_user');
  const storedToken = localStorage.getItem('rest_token');
  const storedRefreshToken = localStorage.getItem('rest_refresh_token');

  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
    refreshToken: storedRefreshToken || null,
    isAuthenticated: !!storedToken,
    login: (user, token, refreshToken) => {
      localStorage.setItem('rest_user', JSON.stringify(user));
      localStorage.setItem('rest_token', token);
      if (refreshToken) {
        localStorage.setItem('rest_refresh_token', refreshToken);
      }
      set({ user, token, refreshToken: refreshToken || null, isAuthenticated: true });
    },
    updateTokens: (token, refreshToken) => {
      localStorage.setItem('rest_token', token);
      if (refreshToken) {
        localStorage.setItem('rest_refresh_token', refreshToken);
      }
      set((state) => ({ ...state, token, refreshToken: refreshToken || state.refreshToken }));
    },
    logout: () => {
      localStorage.removeItem('rest_user');
      localStorage.removeItem('rest_token');
      localStorage.removeItem('rest_refresh_token');
      set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
    }
  };
});

