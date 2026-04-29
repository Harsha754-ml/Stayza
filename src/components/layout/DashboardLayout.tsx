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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = (user?.role === 'admin' || user?.role === 'staff')
    ? [
        { path: '/admin/dashboard', label: 'Overview', icon: Home, color: 'from-blue-500 to-cyan-500' },
        { path: '/admin/complaints', label: 'Complaints', icon: AlertCircle, color: 'from-red-500 to-orange-500' },
        { path: '/admin/allocation', label: 'Room Allocation', icon: Bed, color: 'from-green-500 to-emerald-500' },
        { path: '/admin/payments', label: 'Payments', icon: CreditCard, color: 'from-yellow-500 to-amber-500' },
        { path: '/admin/staff', label: 'Staff', icon: UserCog, color: 'from-purple-500 to-violet-500' },
      ]
    : [
        { path: '/student/dashboard', label: 'Overview', icon: Home, color: 'from-blue-500 to-cyan-500' },
        { path: '/student/rooms', label: 'Book Room', icon: Bed, color: 'from-green-500 to-emerald-500' },
        { path: '/student/roommates', label: 'Roommate Match', icon: Users, color: 'from-purple-500 to-pink-500' },
        { path: '/student/complaints', label: 'Complaints', icon: AlertCircle, color: 'from-red-500 to-orange-500' },
        { path: '/student/payment', label: 'Payments', icon: CreditCard, color: 'from-yellow-500 to-amber-500' },
        { path: '/student/feedback', label: 'Feedback', icon: Star, color: 'from-amber-500 to-yellow-500' },
        { path: '/student/chatbot', label: 'AI Assistant', icon: MessageSquare, color: 'from-primary-500 to-blue-500' },
      ];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary-500/[0.03] rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/[0.03] rounded-full blur-[120px] translate-x-1/3 translate-y-1/3" />
      </div>

      {/* Sidebar */}
      <motion.aside initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="w-[272px] h-full flex flex-col z-20 relative">
        {/* Sidebar background */}
        <div className="absolute inset-0 bg-surface/80 backdrop-blur-2xl border-r border-white/[0.06]" />
        
        {/* Sidebar gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary-500/[0.08] to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <div className="px-5 pt-7 pb-8">
            <StayzaLogo size={36} showText={true} />
            <div className="text-[10px] font-semibold tracking-[0.2em] text-gray-500 uppercase mt-2 pl-[46px]">{user?.role} portal</div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            <div className="text-[10px] font-semibold tracking-[0.15em] text-gray-500 uppercase px-3 mb-3">Navigation</div>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-white/[0.08] text-white'
                        : 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-200'
                    }`}>
                    {isActive && (
                      <motion.div layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-gradient-to-b from-primary-400 to-blue-500"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                    )}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      isActive
                        ? `bg-gradient-to-br ${item.color} shadow-lg`
                        : 'bg-white/[0.05] group-hover:bg-white/[0.08]'
                    }`}>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                    </div>
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-3 mt-auto">
            <div className="rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/[0.06] p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {user?.full_name?.charAt(0) || user?.first_name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white font-semibold truncate">{user?.full_name || `${user?.first_name} ${user?.last_name}`}</div>
                  <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                </div>
              </div>
              <button onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-sm font-medium hover-target border border-red-500/10 hover:border-red-500/20">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto relative z-10">
        <div className="p-8 max-w-[1400px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
