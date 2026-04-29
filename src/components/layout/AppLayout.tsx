import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import CustomCursor from '../animations/CustomCursor';
import { useAuthStore } from '../../store/useAuthStore';

const AppLayout: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="relative min-h-screen w-full text-white selection:bg-primary-500 selection:text-background no-cursor overflow-hidden">
      <CustomCursor />

      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-background/50 backdrop-blur-lg border-b border-white/10 pointer-events-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
            <span className="text-background font-bold text-lg leading-none">S</span>
          </div>
          <div className="text-xl font-bold tracking-tight text-white">Stayza</div>
        </Link>
        <div className="space-x-4">
          {user ? (
            <Link to={user.role === 'student' ? '/student/dashboard' : '/admin/dashboard'}
              className="px-5 py-2 text-sm font-medium text-white hover:text-primary-400 transition-colors hover-target">
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="px-5 py-2 text-sm font-medium text-white hover:text-primary-400 transition-colors hover-target">
              Log in
            </Link>
          )}
        </div>
      </nav>

      <main className="w-full h-full min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
