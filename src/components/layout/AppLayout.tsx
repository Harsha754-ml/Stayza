import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { ArrowRight } from 'lucide-react';
import StayzaLogo from '../ui/StayzaLogo';

const AppLayout: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="relative min-h-screen w-full bg-bg overflow-hidden">
      <nav className="fixed top-0 left-0 w-full z-50 bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex justify-between items-center">
          <Link to="/" className="group">
            <StayzaLogo size={30} showText={true} />
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to={user.role === 'student' ? '/student/dashboard' : '/admin/dashboard'}
                className="inline-flex items-center gap-2 bg-accent text-bg font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-accent-dim hover:scale-[1.02] transition-all">
                Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-text-2 hover:text-text-1 transition-colors px-3 py-2">
                  Sign in
                </Link>
                <Link to="/register"
                  className="inline-flex items-center gap-2 bg-accent text-bg font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-accent-dim hover:scale-[1.02] transition-all">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="w-full min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
