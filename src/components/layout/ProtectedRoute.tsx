import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore, switchToRole } from '../../store/useAuthStore';

interface ProtectedRouteProps {
  allowedRoles?: ('student' | 'admin' | 'staff')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { token, user } = useAuthStore();
  const location = useLocation();

  // If no active session, try to restore the right one based on URL
  if (!token || !user) {
    const isAdminPath = location.pathname.startsWith('/admin');
    const restored = switchToRole(isAdminPath ? 'admin' : 'student');
    if (!restored) {
      return <Navigate to="/login" replace />;
    }
    // After restoring, re-read from store
    const state = useAuthStore.getState();
    if (!state.token || !state.user) {
      return <Navigate to="/login" replace />;
    }
    if (allowedRoles && !allowedRoles.includes(state.user.role)) {
      return <Navigate to="/login" replace />;
    }
    return <Outlet />;
  }

  // If wrong role for this route, try switching to the correct session
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const targetRole = allowedRoles[0];
    const switched = switchToRole(targetRole);
    if (switched) {
      // Session switched, render the route
      return <Outlet />;
    }
    // No session for this role — redirect to login
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
