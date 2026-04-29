import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bed, AlertCircle, CreditCard, Activity, ArrowUpRight, TrendingUp, Clock, Star } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { roomService, complaintService, paymentService, feedbackService } from '../../services/api';

interface DashboardData {
  roomNumber: string;
  roomType: string;
  activeComplaints: number;
  pendingDues: number;
  pendingFeedback: number;
  recentComplaints: Array<{ id: number; title: string; status: string; priority: string; created_at: string }>;
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData>({
    roomNumber: '—', roomType: '', activeComplaints: 0, pendingDues: 0, pendingFeedback: 0, recentComplaints: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, complaintsRes, paymentsRes, feedbackRes] = await Promise.all([
          roomService.myBookings(),
          complaintService.mine(),
          paymentService.mine(),
          feedbackService.pending().catch(() => ({ data: [] })),
        ]);

        const bookings = bookingsRes.data.results || bookingsRes.data;
        const activeBooking = bookings.find((b: { is_active: boolean }) => b.is_active);
        const complaints = complaintsRes.data.results || complaintsRes.data;
        const payments = paymentsRes.data.results || paymentsRes.data;

        setData({
          roomNumber: activeBooking?.room_detail?.number || '—',
          roomType: activeBooking?.room_detail?.room_type || '',
          activeComplaints: complaints.filter((c: { status: string }) => c.status !== 'resolved').length,
          pendingDues: payments.filter((p: { status: string }) => p.status !== 'paid').reduce((sum: number, p: { amount: number | string }) => sum + Number(p.amount), 0),
          pendingFeedback: feedbackRes.data.length || 0,
          recentComplaints: complaints.slice(0, 4),
        });
      } catch (err) { console.error('Dashboard load failed:', err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="skeleton h-10 w-64" />
          <div className="skeleton h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-36 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 skeleton h-72 rounded-2xl" />
          <div className="skeleton h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Room', value: data.roomNumber, sub: data.roomType || 'Not assigned',
      icon: Bed, gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', glow: 'shadow-blue-500/20',
    },
    {
      label: 'Active Complaints', value: String(data.activeComplaints), sub: data.activeComplaints === 0 ? 'All clear' : 'Needs attention',
      icon: AlertCircle, gradient: 'from-orange-500 to-amber-500', bg: 'bg-orange-500/10', glow: 'shadow-orange-500/20',
    },
    {
      label: 'Pending Dues', value: `₹${data.pendingDues.toLocaleString()}`, sub: data.pendingDues === 0 ? 'Paid up' : 'Due this month',
      icon: CreditCard, gradient: 'from-red-500 to-pink-500', bg: 'bg-red-500/10', glow: 'shadow-red-500/20',
    },
    {
      label: 'Feedback', value: String(data.pendingFeedback), sub: data.pendingFeedback === 0 ? 'All reviewed' : 'Pending reviews',
      icon: Star, gradient: 'from-yellow-500 to-amber-500', bg: 'bg-yellow-500/10', glow: 'shadow-yellow-500/20',
    },
  ];

  const quickActions = [
    { label: 'Book Room', desc: 'Find your ideal space', path: '/student/rooms', icon: Bed, gradient: 'from-green-500 to-emerald-500' },
    { label: 'File Complaint', desc: 'Report an issue', path: '/student/complaints', icon: AlertCircle, gradient: 'from-orange-500 to-red-500' },
    { label: 'Pay Dues', desc: 'Clear pending payments', path: '/student/payment', icon: CreditCard, gradient: 'from-blue-500 to-indigo-500' },
    { label: 'Find Roommate', desc: 'AI-powered matching', path: '/student/roommates', icon: Activity, gradient: 'from-purple-500 to-pink-500' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2 text-primary-400 text-sm font-medium mb-1">
          <TrendingUp className="w-4 h-4" />
          Dashboard
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-400">{user?.first_name || 'Student'}</span>
        </h1>
        <p className="text-gray-500 mt-2">Here's what's happening with your accommodation today.</p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div key={idx} whileHover={{ y: -4, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}
              className={`relative overflow-hidden rounded-2xl glass glass-hover p-5 shadow-lg ${stat.glow}`}>
              {/* Background glow */}
              <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full ${stat.bg} blur-2xl`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-600" />
                </div>
                <div className="text-2xl font-bold text-white mb-0.5">{stat.value}</div>
                <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
                <div className="text-[11px] text-gray-600 mt-1">{stat.sub}</div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Complaints */}
        <motion.div variants={item} className="lg:col-span-2 glass rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Recent Complaints</h2>
              <p className="text-xs text-gray-500 mt-0.5">{data.recentComplaints.length} total</p>
            </div>
            <Link to="/student/complaints" className="text-xs text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1 hover-target">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4">
            {data.recentComplaints.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No complaints filed yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.recentComplaints.map((c, idx) => (
                  <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.08 }}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-all group">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      c.status === 'resolved' ? 'bg-green-400' : c.status === 'in_progress' ? 'bg-orange-400' : 'bg-blue-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white font-medium truncate">{c.title}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-gray-500 capitalize">{c.status.replace('_', ' ')}</span>
                        <span className="text-gray-700">·</span>
                        <span className="text-[11px] text-gray-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />{new Date(c.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                      c.priority === 'high' ? 'bg-red-500/15 text-red-400' :
                      c.priority === 'medium' ? 'bg-yellow-500/15 text-yellow-400' :
                      'bg-green-500/15 text-green-400'
                    }`}>{c.priority}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item} className="space-y-3">
          <h2 className="text-lg font-bold text-white px-1">Quick Actions</h2>
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link key={idx} to={action.path}>
                <motion.div whileHover={{ x: 4, scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-4 p-4 rounded-2xl glass glass-hover group hover-target mb-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white group-hover:text-primary-400 transition-colors">{action.label}</div>
                    <div className="text-xs text-gray-500">{action.desc}</div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-primary-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </motion.div>
              </Link>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StudentDashboard;
