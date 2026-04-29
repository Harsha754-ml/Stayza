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
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <motion.aside initial={{ x: -280 }} animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="w-[264px] h-full flex flex-col bg-surface border-r border-warm-200 shrink-0">
        
        {/* Logo */}
        <div className="px-6 pt-7 pb-6 border-b border-warm-100">
          <StayzaLogo size={34} showText={true} />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-semibold tracking-[0.15em] text-warm-400 uppercase px-3 mb-3">
            {user?.role === 'student' ? 'Student' : 'Admin'} Menu
          </div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-accent/10 text-accent-dark'
                      : 'text-warm-500 hover:bg-warm-100 hover:text-warm-800'
                  }`}>
                  {isActive && (
                    <motion.div layoutId="sidebar-pill"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-accent"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                  )}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isActive ? 'bg-accent/15' : 'bg-warm-100 group-hover:bg-warm-200'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-warm-400" />}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-warm-100">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center text-accent font-bold text-sm">
              {user?.full_name?.charAt(0) || user?.first_name?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-warm-800 truncate">{user?.full_name || `${user?.first_name} ${user?.last_name}`}</div>
              <div className="text-[11px] text-warm-400 truncate">{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-warm-500 hover:text-danger hover:bg-danger/5 rounded-xl transition-all text-sm font-medium border border-warm-200 hover:border-danger/20">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <main className="flex-1 h-full overflow-y-auto bg-background paper-texture">
        <div className="p-8 sm:p-10 max-w-[1200px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
