import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

interface ProtectedRouteProps {
  allowedRoles?: ('student' | 'admin' | 'staff')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { token, user } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If wrong role, redirect to THEIR dashboard (not landing page)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const correctPath = user.role === 'student' ? '/student/dashboard' : '/admin/dashboard';
    return <Navigate to={correctPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
