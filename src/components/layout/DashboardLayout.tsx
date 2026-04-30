import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Home, MessageSquare, CreditCard, Bed, LogOut, AlertCircle, Users, UserCog, Star } from 'lucide-react';
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
        { path: '/student/roommates', label: 'Roommates', icon: Users },
        { path: '/student/complaints', label: 'Complaints', icon: AlertCircle },
        { path: '/student/payment', label: 'Payments', icon: CreditCard },
        { path: '/student/feedback', label: 'Feedback', icon: Star },
        { path: '/student/chatbot', label: 'AI Assistant', icon: MessageSquare },
      ];

  return (
    <div className="flex h-screen w-full bg-base overflow-hidden">
      {/* Sidebar — 220px, fixed */}
      <aside className="w-[220px] h-full flex flex-col bg-elevated border-r border-border shrink-0">
        {/* Logo — 64px */}
        <div className="h-16 flex items-center px-4 border-b border-border">
          <StayzaLogo size={26} showText={true} />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto relative">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <div className={`relative flex items-center gap-2.5 h-9 px-3 rounded-lg text-[14px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-accent-glow text-accent border-l-2 border-accent'
                    : 'text-text-2 hover:bg-overlay hover:text-text-1 border-l-2 border-transparent'
                }`}>
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2.5 px-1 mb-3">
            <div className="w-8 h-8 rounded-full bg-accent-glow flex items-center justify-center text-accent text-[13px] font-semibold shrink-0">
              {user?.full_name?.charAt(0) || user?.first_name?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-text-1 truncate">{user?.full_name || `${user?.first_name} ${user?.last_name}`}</div>
              <div className="text-[11px] text-text-2 truncate">{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 h-8 text-text-2 hover:text-red hover:bg-red-bg rounded-lg transition-all duration-150 text-[13px] font-medium border border-border hover:border-red/20">
            <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar — 56px */}
        <header className="h-14 flex items-center justify-end px-8 bg-base border-b border-border shrink-0">
          <Link to="/login"
            className="text-[13px] font-medium text-text-1 px-4 py-2 rounded-lg border border-border-strong hover:border-accent hover:text-accent transition-all duration-200">
            Switch account
          </Link>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-base">
          <div className="px-10 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
