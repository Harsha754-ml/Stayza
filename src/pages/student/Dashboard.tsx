import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bed, AlertCircle, CreditCard, Star, ArrowRight, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { roomService, complaintService, paymentService, feedbackService } from '../../services/api';

interface DashboardData {
  roomNumber: string; roomType: string; activeComplaints: number;
  pendingDues: number; pendingFeedback: number;
  recentComplaints: Array<{ id: number; title: string; status: string; priority: string; created_at: string }>;
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData>({
    roomNumber: '—', roomType: '', activeComplaints: 0, pendingDues: 0, pendingFeedback: 0, recentComplaints: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bRes, cRes, pRes, fRes] = await Promise.all([
          roomService.myBookings(), complaintService.mine(), paymentService.mine(),
          feedbackService.pending().catch(() => ({ data: [] })),
        ]);
        const bookings = bRes.data.results || bRes.data;
        const active = bookings.find((b: { is_active: boolean }) => b.is_active);
        const complaints = cRes.data.results || cRes.data;
        const payments = pRes.data.results || pRes.data;
        setData({
          roomNumber: active?.room_detail?.number || '—',
          roomType: active?.room_detail?.room_type || '',
          activeComplaints: complaints.filter((c: { status: string }) => c.status !== 'resolved').length,
          pendingDues: payments.filter((p: { status: string }) => p.status !== 'paid').reduce((s: number, p: { amount: number | string }) => s + Number(p.amount), 0),
          pendingFeedback: fRes.data.length || 0,
          recentComplaints: complaints.slice(0, 4),
        });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="space-y-8"><div className="skeleton h-10 w-64" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="skeleton h-28 rounded-xl" />)}</div></div>;
  }

  const stats = [
    { label: 'Your Room', value: data.roomNumber, sub: data.roomType || 'Not assigned', icon: Bed },
    { label: 'Open Complaints', value: String(data.activeComplaints), sub: data.activeComplaints === 0 ? 'All clear' : 'Needs attention', icon: AlertCircle },
    { label: 'Pending Dues', value: `₹${data.pendingDues.toLocaleString()}`, sub: data.pendingDues === 0 ? 'Paid up' : 'Due this month', icon: CreditCard },
    { label: 'Feedback', value: String(data.pendingFeedback), sub: data.pendingFeedback === 0 ? 'All reviewed' : 'To rate', icon: Star },
  ];

  const actions = [
    { label: 'Book a room', desc: 'Find your space', path: '/student/rooms', icon: Bed },
    { label: 'Report an issue', desc: 'File a complaint', path: '/student/complaints', icon: AlertCircle },
    { label: 'Pay dues', desc: 'Clear payments', path: '/student/payment', icon: CreditCard },
    { label: 'Find roommate', desc: 'AI matching', path: '/student/roommates', icon: Star },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={item}>
        <p className="text-sm text-text-3 mb-1">Dashboard</p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-text-1">
          Welcome back, <span className="text-accent italic">{user?.first_name || 'there'}</span>
        </h1>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="card p-5">
              <div className="w-9 h-9 rounded-lg bg-accent-bg border border-accent/20 flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-accent" />
              </div>
              <div className="font-[family-name:var(--font-display)] text-2xl text-text-1 mb-0.5">{s.value}</div>
              <div className="text-[11px] font-medium text-text-3 uppercase tracking-wide">{s.label}</div>
              <div className="text-[11px] text-text-3 mt-1">{s.sub}</div>
            </div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div variants={item} className="lg:col-span-2 card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-1">Recent complaints</h2>
            <Link to="/student/complaints" className="text-xs text-accent font-medium flex items-center gap-1 hover:text-accent-dim transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4">
            {data.recentComplaints.length === 0 ? (
              <div className="text-center py-10 text-text-3 text-sm">No complaints yet — that's a good sign.</div>
            ) : (
              <div className="space-y-1">
                {data.recentComplaints.map(c => (
                  <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-2 transition-colors">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      c.status === 'resolved' ? 'bg-success' : c.status === 'in_progress' ? 'bg-warning' : 'bg-info'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-text-1 truncate">{c.title}</div>
                      <div className="text-[11px] text-text-3 flex items-center gap-1.5 mt-0.5">
                        <span className="capitalize">{c.status.replace('_', ' ')}</span>
                        <span>·</span>
                        <Clock className="w-3 h-3" />{new Date(c.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      c.priority === 'high' ? 'bg-danger/10 text-danger' :
                      c.priority === 'medium' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                    }`}>{c.priority}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={item} className="space-y-2">
          <h2 className="text-base font-semibold text-text-1 px-1 mb-2">Quick actions</h2>
          {actions.map((a, i) => {
            const Icon = a.icon;
            return (
              <Link key={i} to={a.path}>
                <motion.div whileTap={{ scale: 0.98 }}
                  className="card p-4 flex items-center gap-3 group hover-target mb-2">
                  <div className="w-9 h-9 rounded-lg bg-accent-bg border border-accent/20 flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-bg group-hover:border-accent transition-all">
                    <Icon className="w-4 h-4 text-accent group-hover:text-bg transition-colors" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-text-1 group-hover:text-accent transition-colors">{a.label}</div>
                    <div className="text-[11px] text-text-3">{a.desc}</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-text-3 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
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
