import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { Home, MessageSquare, CreditCard, Bed, LogOut, AlertCircle, Users, UserCog, Star } from 'lucide-react';

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
        { path: '/admin/dashboard', label: 'Overview', icon: Home },
        { path: '/admin/complaints', label: 'Complaints', icon: AlertCircle },
        { path: '/admin/allocation', label: 'Room Allocation', icon: Bed },
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
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-primary-900/30 to-transparent" />
      </div>

      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-64 bg-surface/50 border-r border-white/10 backdrop-blur-xl h-full flex flex-col z-20"
      >
        <div className="p-6">
          <div className="text-2xl font-black tracking-tighter text-white">STAYZA</div>
          <div className="text-xs text-primary-400 font-mono mt-1">{user?.role.toUpperCase()} PORTAL</div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-8">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-xl transition-all hover-target ${
                  isActive 
                    ? 'bg-primary-500/20 text-primary-400' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute left-0 w-1 h-8 bg-primary-500 rounded-r-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center mb-4 px-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-blue-500 flex items-center justify-center text-white font-bold">
              {user?.full_name?.charAt(0) || user?.first_name?.charAt(0) || '?'}
            </div>
            <div className="ml-3">
              <div className="text-sm text-white font-medium">{user?.full_name || `${user?.first_name} ${user?.last_name}`}</div>
              <div className="text-xs text-gray-500 truncate w-32">{user?.email}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all hover-target"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto relative z-10 scroll-smooth">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
