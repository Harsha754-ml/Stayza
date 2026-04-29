import { create } from 'zustand';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'student' | 'admin' | 'staff';
  phone: string;
  sleep_schedule: string;
  cleanliness_level: number;
  noise_tolerance: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  login: (user: User, access: string, refresh: string) => void;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),

  login: (user, access, refresh) => {
    localStorage.setItem('token', access);
    localStorage.setItem('refreshToken', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token: access, refreshToken: refresh });
  },

  setTokens: (access, refresh) => {
    localStorage.setItem('token', access);
    localStorage.setItem('refreshToken', refresh);
    set({ token: access, refreshToken: refresh });
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ user: null, token: null, refreshToken: null });
  },
}));
