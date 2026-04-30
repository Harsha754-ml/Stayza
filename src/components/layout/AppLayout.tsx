import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Shield, GraduationCap } from 'lucide-react';
import StayzaLogo from '../ui/StayzaLogo';

const AppLayout: React.FC = () => {
  const hasStudent = !!localStorage.getItem('student_token');
  const hasAdmin = !!localStorage.getItem('admin_token');

  return (
    <div className="relative min-h-screen w-full bg-base overflow-hidden">
      <nav className="fixed top-0 left-0 w-full z-50 bg-elevated border-b border-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-14 flex justify-between items-center">
          <Link to="/"><StayzaLogo size={26} showText={true} /></Link>
          <div className="flex items-center gap-3">
            {hasStudent && (
              <Link to="/student/dashboard" className="flex items-center gap-1.5 text-[13px] font-medium text-text-2 hover:text-text-1 transition-colors px-3 py-1.5">
                <GraduationCap className="w-3.5 h-3.5" strokeWidth={1.5} /> Student
              </Link>
            )}
            {hasAdmin && (
              <Link to="/admin/dashboard" className="flex items-center gap-1.5 text-[13px] font-medium text-text-2 hover:text-text-1 transition-colors px-3 py-1.5">
                <Shield className="w-3.5 h-3.5" strokeWidth={1.5} /> Admin
              </Link>
            )}
            {!hasStudent && !hasAdmin ? (
              <>
                <Link to="/login" className="text-[13px] font-medium text-text-2 hover:text-text-1 transition-colors px-3 py-2">Sign in</Link>
                <Link to="/register" className="text-[13px] font-medium text-base bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dim transition-all">
                  Get Started
                </Link>
              </>
            ) : (
              <Link to="/login" className="text-[13px] font-medium text-text-1 px-4 py-2 rounded-lg border border-border-strong hover:border-accent hover:text-accent transition-all duration-200">
                Switch account
              </Link>
            )}
          </div>
        </div>
      </nav>
      <main className="w-full min-h-screen"><Outlet /></main>
    </div>
  );
};

export default AppLayout;
