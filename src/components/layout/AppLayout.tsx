import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { ArrowRight, Shield, GraduationCap } from 'lucide-react';
import StayzaLogo from '../ui/StayzaLogo';

const AppLayout: React.FC = () => {
  const { user } = useAuthStore();

  // Check if both sessions exist
  const hasStudentSession = !!localStorage.getItem('student_token');
  const hasAdminSession = !!localStorage.getItem('admin_token');

  // Don't redirect from auth pages — user might want to log in as a different role
  // The login page handles its own logic

  return (
    <div className="relative min-h-screen w-full bg-bg overflow-hidden">
      <nav className="fixed top-0 left-0 w-full z-50 bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex justify-between items-center">
          <Link to="/" className="group">
            <StayzaLogo size={30} showText={true} />
          </Link>
          <div className="flex items-center gap-3">
            {hasStudentSession && (
              <Link to="/student/dashboard"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-text-2 hover:text-text-1 transition-colors px-3 py-2">
                <GraduationCap className="w-3.5 h-3.5" /> Student
              </Link>
            )}
            {hasAdminSession && (
              <Link to="/admin/dashboard"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-text-2 hover:text-text-1 transition-colors px-3 py-2">
                <Shield className="w-3.5 h-3.5" /> Admin
              </Link>
            )}
            {!hasStudentSession && !hasAdminSession && (
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
            {(hasStudentSession || hasAdminSession) && (
              <Link to="/login"
                className="inline-flex items-center gap-2 bg-accent text-bg font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-accent-dim hover:scale-[1.02] transition-all">
                {hasStudentSession && hasAdminSession ? 'Switch Account' : 'Sign in as another'} <ArrowRight className="w-4 h-4" />
              </Link>
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
