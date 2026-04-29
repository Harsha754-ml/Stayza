import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bed, AlertCircle, CreditCard, Star, ArrowRight, Clock } from 'lucide-react';
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
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } } };

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
          roomService.myBookings(), complaintService.mine(), paymentService.mine(),
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
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="skeleton h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Your Room', value: data.roomNumber, sub: data.roomType || 'Not assigned yet', icon: Bed, color: 'bg-info/10 text-info' },
    { label: 'Open Complaints', value: String(data.activeComplaints), sub: data.activeComplaints === 0 ? 'All clear ✓' : 'Needs attention', icon: AlertCircle, color: 'bg-warning/10 text-warning' },
    { label: 'Pending Dues', value: `₹${data.pendingDues.toLocaleString()}`, sub: data.pendingDues === 0 ? 'You\'re all paid up' : 'Due this month', icon: CreditCard, color: 'bg-danger/10 text-danger' },
    { label: 'Feedback', value: String(data.pendingFeedback), sub: data.pendingFeedback === 0 ? 'All reviewed' : 'Roommates to rate', icon: Star, color: 'bg-amber/10 text-amber' },
  ];

  const quickActions = [
    { label: 'Book a room', desc: 'Find your ideal space', path: '/student/rooms', icon: Bed },
    { label: 'Report an issue', desc: 'File a complaint', path: '/student/complaints', icon: AlertCircle },
    { label: 'Pay your dues', desc: 'Clear pending payments', path: '/student/payment', icon: CreditCard },
    { label: 'Find a roommate', desc: 'AI-powered matching', path: '/student/roommates', icon: Star },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-10">
      {/* Header */}
      <motion.div variants={item}>
        <p className="text-sm text-warm-400 mb-1">Good to see you again</p>
        <h1 className="text-4xl text-warm-900">
          Welcome back, <span className="text-accent italic">{user?.first_name || 'there'}</span>
        </h1>
        <p className="text-warm-500 mt-2">Here's what's happening with your accommodation.</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div key={idx} variants={item} className="card p-6">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-warm-900 font-[family-name:var(--font-display)] mb-0.5">{stat.value}</div>
              <div className="text-xs text-warm-400 font-medium">{stat.label}</div>
              <div className="text-[11px] text-warm-300 mt-1">{stat.sub}</div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Complaints */}
        <motion.div variants={item} className="lg:col-span-2 card overflow-hidden">
          <div className="px-6 py-5 border-b border-warm-100 flex items-center justify-between">
            <h2 className="text-xl text-warm-900">Recent complaints</h2>
            <Link to="/student/complaints" className="text-xs text-accent font-semibold flex items-center gap-1 hover:text-accent-dark transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-5">
            {data.recentComplaints.length === 0 ? (
              <div className="text-center py-10 text-warm-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No complaints yet — that's a good sign!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.recentComplaints.map((c) => (
                  <div key={c.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-warm-50 transition-colors">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      c.status === 'resolved' ? 'bg-success' : c.status === 'in_progress' ? 'bg-warning' : 'bg-info'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-warm-800 truncate">{c.title}</div>
                      <div className="text-[11px] text-warm-400 flex items-center gap-1.5 mt-0.5">
                        <span className="capitalize">{c.status.replace('_', ' ')}</span>
                        <span className="text-warm-300">·</span>
                        <Clock className="w-3 h-3" />{new Date(c.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${
                      c.priority === 'high' ? 'bg-danger/10 text-danger' :
                      c.priority === 'medium' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                    }`}>{c.priority}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item} className="space-y-3">
          <h2 className="text-xl text-warm-900 px-1">Quick actions</h2>
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link key={idx} to={action.path}>
                <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
                  className="card p-4 flex items-center gap-4 group hover-target mb-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-warm-800 group-hover:text-accent transition-colors">{action.label}</div>
                    <div className="text-xs text-warm-400">{action.desc}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-warm-300 group-hover:text-accent group-hover:translate-x-1 transition-all" />
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
