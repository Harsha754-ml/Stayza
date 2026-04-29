import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { ArrowRight } from 'lucide-react';
import StayzaLogo from '../ui/StayzaLogo';

const AppLayout: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="relative min-h-screen w-full text-white overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 pointer-events-auto">
        <div className="mx-4 mt-4">
          <div className="max-w-7xl mx-auto px-6 py-3 rounded-2xl bg-background/60 backdrop-blur-2xl border border-white/[0.06] flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <StayzaLogo size={32} showText={true} />
            </Link>
            <div className="flex items-center gap-3">
              {user ? (
                <Link to={user.role === 'student' ? '/student/dashboard' : '/admin/dashboard'}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-xl transition-all hover-target">
                  Dashboard <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <>
                  <Link to="/login"
                    className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors hover-target">
                    Sign in
                  </Link>
                  <Link to="/register"
                    className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-blue-600 rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-shadow hover-target">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="w-full h-full min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
