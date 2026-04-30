import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 → logout
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = useAuthStore.getState().refreshToken;
      if (refresh) {
        try {
          const res = await axios.post(`${API_URL}/auth/token/refresh/`, {
            refresh,
          });
          useAuthStore.getState().setTokens(res.data.access, res.data.refresh);
          original.headers.Authorization = `Bearer ${res.data.access}`;
          return api(original);
        } catch {
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
      } else {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──
export const authService = {
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login/', data),
  register: (data: Record<string, unknown>) =>
    api.post('/auth/register/', data),
  profile: () => api.get('/auth/profile/'),
  updateProfile: (data: Record<string, unknown>) =>
    api.patch('/auth/profile/', data),
  roommateMatches: () => api.get('/auth/roommate-matches/'),
  staffList: () => api.get('/auth/staff/'),
};

// ── Rooms ──
export const roomService = {
  list: (params?: Record<string, string>) =>
    api.get('/rooms/', { params }),
  detail: (id: number) => api.get(`/rooms/${id}/`),
  create: (data: Record<string, unknown>) =>
    api.post('/rooms/create/', data),
  update: (id: number, data: Record<string, unknown>) =>
    api.patch(`/rooms/${id}/`, data),
  book: (roomId: number) =>
    api.post('/rooms/book/', { room_id: roomId }),
  checkout: () => api.post('/rooms/checkout/'),
  myBookings: () => api.get('/rooms/my-bookings/'),
  allBookings: (params?: Record<string, string>) =>
    api.get('/rooms/all-bookings/', { params }),
  adminAssign: (userId: number, roomId: number) =>
    api.post('/rooms/admin-assign/', { user_id: userId, room_id: roomId }),
};

// ── Complaints ──
export const complaintService = {
  list: (params?: Record<string, string>) =>
    api.get('/complaints/', { params }),
  mine: () => api.get('/complaints/mine/'),
  detail: (id: number) => api.get(`/complaints/${id}/`),
  create: (data: FormData) =>
    api.post('/complaints/create/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, data: Record<string, unknown>) =>
    api.patch(`/complaints/${id}/`, data),
  assign: (id: number, staffId: number) =>
    api.post(`/complaints/${id}/assign/`, { staff_id: staffId }),
  resolve: (id: number) =>
    api.post(`/complaints/${id}/resolve/`),
};

// ── Payments ──
export const paymentService = {
  list: (params?: Record<string, string>) =>
    api.get('/payments/', { params }),
  mine: () => api.get('/payments/mine/'),
  create: (data: Record<string, unknown>) =>
    api.post('/payments/create/', data),
  markPaid: (id: number, method: string) =>
    api.post(`/payments/${id}/pay/`, { method }),
  summary: () => api.get('/payments/summary/'),
};

// ── Feedback ──
export const feedbackService = {
  submit: (data: {
    reviewee: number;
    booking: number;
    cleanliness_rating: number;
    noise_rating: number;
    overall_rating: number;
    comment: string;
  }) => api.post('/feedback/submit/', data),
  pending: () => api.get('/feedback/pending/'),
  given: () => api.get('/feedback/given/'),
  received: () => api.get('/feedback/received/'),
  all: () => api.get('/feedback/'),
  reputation: (userId: number) => api.get(`/feedback/reputation/${userId}/`),
};

// ── Notifications ──
export const notificationService = {
  list: () => api.get('/auth/notifications/'),
};

// ── Analytics ──
export const analyticsService = {
  dashboard: () => api.get('/rooms/analytics/'),
};
