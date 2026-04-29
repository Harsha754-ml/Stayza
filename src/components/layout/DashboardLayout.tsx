import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { Home, MessageSquare, CreditCard, Bed, LogOut, AlertCircle, Users, UserCog, Star, ChevronRight } from 'lucide-react';
import StayzaLogo from '../ui/StayzaLogo';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = (user?.role === 'admin' || user?.role === 'staff')
    ? [
        { path: '/admin/dashboard', label: 'Overview', icon: Home },
        { path: '/admin/complaints', label: 'Complaints', icon: AlertCircle },
        { path: '/admin/allocation', label: 'Rooms', icon: Bed },
        { path: '/admin/payments', label: 'Payments', icon: CreditCard },
        { path: '/admin/staff', label: 'Staff', icon: UserCog },
      ]
    : [
        { path: '/student/dashboard', label: 'Overview', icon: Home },
        { path: '/student/rooms', label: 'Book Room', icon: Bed },
        { path: '/student/roommates', label: 'Roommate Match', icon: Users },
        { path: '/student/complaints', label: 'Complaints', icon: AlertCircle },
        { path: '/student/payment', label: 'Payments', icon: CreditCard },
        { path: '/student/feedback', label: 'Feedback', icon: Star },
        { path: '/student/chatbot', label: 'AI Assistant', icon: MessageSquare },
      ];

  return (
    <div className="flex h-screen w-full bg-bg overflow-hidden">
      <motion.aside initial={{ x: -260 }} animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="w-[256px] h-full flex flex-col bg-surface border-r border-border shrink-0">

        <div className="px-5 pt-6 pb-5 border-b border-border">
          <StayzaLogo size={30} showText={true} />
        </div>

        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          <div className="text-[10px] font-semibold tracking-[0.12em] text-text-3 uppercase px-3 mb-3">
            {user?.role === 'student' ? 'Student' : 'Admin'} Menu
          </div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <motion.div whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                    isActive ? 'bg-accent-bg text-accent' : 'text-text-2 hover:bg-surface-2 hover:text-text-1'
                  }`}>
                  {isActive && (
                    <motion.div layoutId="nav-pill"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r bg-accent"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                  )}
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="w-3 h-3 text-text-3" />}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent-bg border border-accent/20 flex items-center justify-center text-accent font-semibold text-xs">
              {user?.full_name?.charAt(0) || user?.first_name?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-text-1 truncate">{user?.full_name || `${user?.first_name} ${user?.last_name}`}</div>
              <div className="text-[11px] text-text-3 truncate">{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-text-2 hover:text-danger hover:bg-danger/5 rounded-lg transition-all text-sm font-medium border border-border hover:border-danger/20">
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </motion.aside>

      <main className="flex-1 h-full overflow-y-auto bg-bg">
        <div className="p-8 sm:p-10 max-w-[1200px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
