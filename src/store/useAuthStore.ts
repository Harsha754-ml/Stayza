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

/**
 * Storage keys are prefixed by role so admin and student
 * sessions can coexist in the same browser.
 */
const getKeys = (role?: string) => {
  const prefix = role === 'admin' || role === 'staff' ? 'admin' : 'student';
  return {
    token: `${prefix}_token`,
    refresh: `${prefix}_refreshToken`,
    user: `${prefix}_user`,
  };
};

/** Figure out which session to restore on page load */
const restoreSession = (): { user: User | null; token: string | null; refreshToken: string | null } => {
  // Check current URL to decide which session to restore
  const path = window.location.pathname;
  const isAdminPath = path.startsWith('/admin');

  const prefix = isAdminPath ? 'admin' : 'student';
  const userStr = localStorage.getItem(`${prefix}_user`);
  const token = localStorage.getItem(`${prefix}_token`);
  const refresh = localStorage.getItem(`${prefix}_refreshToken`);

  if (userStr && token) {
    try {
      return { user: JSON.parse(userStr), token, refreshToken: refresh };
    } catch { /* ignore */ }
  }

  // Fallback: try the other role
  const otherPrefix = isAdminPath ? 'student' : 'admin';
  const otherUser = localStorage.getItem(`${otherPrefix}_user`);
  const otherToken = localStorage.getItem(`${otherPrefix}_token`);
  const otherRefresh = localStorage.getItem(`${otherPrefix}_refreshToken`);

  if (otherUser && otherToken) {
    try {
      return { user: JSON.parse(otherUser), token: otherToken, refreshToken: otherRefresh };
    } catch { /* ignore */ }
  }

  return { user: null, token: null, refreshToken: null };
};

const initial = restoreSession();

export const useAuthStore = create<AuthState>((set) => ({
  user: initial.user,
  token: initial.token,
  refreshToken: initial.refreshToken,

  login: (user, access, refresh) => {
    const keys = getKeys(user.role);
    localStorage.setItem(keys.token, access);
    localStorage.setItem(keys.refresh, refresh);
    localStorage.setItem(keys.user, JSON.stringify(user));
    set({ user, token: access, refreshToken: refresh });
  },

  setTokens: (access, refresh) => {
    const state = useAuthStore.getState();
    const keys = getKeys(state.user?.role);
    localStorage.setItem(keys.token, access);
    localStorage.setItem(keys.refresh, refresh);
    set({ token: access, refreshToken: refresh });
  },

  setUser: (user) => {
    const keys = getKeys(user.role);
    localStorage.setItem(keys.user, JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    const state = useAuthStore.getState();
    const keys = getKeys(state.user?.role);
    localStorage.removeItem(keys.token);
    localStorage.removeItem(keys.refresh);
    localStorage.removeItem(keys.user);
    set({ user: null, token: null, refreshToken: null });
  },
}));

/**
 * Switch the active session to a different role.
 * Call this when navigating between /admin and /student paths.
 */
export const switchToRole = (role: 'student' | 'admin' | 'staff') => {
  const keys = getKeys(role);
  const userStr = localStorage.getItem(keys.user);
  const token = localStorage.getItem(keys.token);
  const refresh = localStorage.getItem(keys.refresh);

  if (userStr && token) {
    try {
      const user = JSON.parse(userStr);
      useAuthStore.setState({ user, token, refreshToken: refresh });
      return true;
    } catch { /* ignore */ }
  }
  return false;
};
