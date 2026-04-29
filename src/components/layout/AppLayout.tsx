import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { ArrowRight } from 'lucide-react';
import StayzaLogo from '../ui/StayzaLogo';

const AppLayout: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="relative min-h-screen w-full bg-background overflow-hidden">
      {/* Frameless floating navbar */}
      <nav className="fixed top-0 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <Link to="/" className="group">
            <div className="transition-transform duration-300 group-hover:rotate-[-6deg]">
              <StayzaLogo size={34} showText={true} />
            </div>
          </Link>
          <div className="flex items-center gap-4 font-body">
            {user ? (
              <Link to={user.role === 'student' ? '/student/dashboard' : '/admin/dashboard'}
                className="btn-pill btn-pill-primary text-sm py-3 px-7 flex items-center gap-2">
                Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-warm-600 hover:text-warm-900 transition-colors px-4 py-2">
                  Sign in
                </Link>
                <Link to="/register" className="btn-pill btn-pill-primary text-sm py-3 px-7 flex items-center gap-2">
                  Get Started <ArrowRight className="w-4 h-4" />
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
