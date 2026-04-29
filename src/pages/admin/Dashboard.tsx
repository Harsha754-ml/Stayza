import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BedDouble, AlertTriangle, CreditCard, UserCog, ArrowUpRight, Flame, TrendingUp, Clock, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { roomService, complaintService, paymentService } from '../../services/api';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ rooms: 0, available: 0, complaints: 0, escalated: 0 });
  const [paymentSummary, setPaymentSummary] = useState({ collected: 0, pending: 0, overdue: 0 });
  const [recentComplaints, setRecentComplaints] = useState<Array<{
    id: number; title: string; priority: string; status: string;
    filed_by_detail: { full_name: string };
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, complaintsRes, paySummaryRes] = await Promise.all([
          roomService.list(), complaintService.list(), paymentService.summary(),
        ]);
        const rooms = roomsRes.data.results || roomsRes.data;
        const complaints = complaintsRes.data.results || complaintsRes.data;
        setStats({
          rooms: rooms.length,
          available: rooms.filter((r: { status: string }) => r.status === 'available').length,
          complaints: complaints.filter((c: { status: string }) => c.status !== 'resolved').length,
          escalated: complaints.filter((c: { escalated: boolean }) => c.escalated).length,
        });
        setPaymentSummary({
          collected: paySummaryRes.data.collected.amount,
          pending: paySummaryRes.data.pending.amount,
          overdue: paySummaryRes.data.overdue.amount,
        });
        setRecentComplaints(complaints.filter((c: { status: string }) => c.status !== 'resolved').slice(0, 5));
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
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-36 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Rooms', value: String(stats.rooms), sub: `${stats.available} available`, icon: BedDouble, gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', glow: 'shadow-blue-500/20' },
    { label: 'Available', value: String(stats.available), sub: 'Ready to book', icon: BedDouble, gradient: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10', glow: 'shadow-green-500/20' },
    { label: 'Open Complaints', value: String(stats.complaints), sub: `${stats.escalated} escalated`, icon: AlertTriangle, gradient: 'from-orange-500 to-amber-500', bg: 'bg-orange-500/10', glow: 'shadow-orange-500/20' },
    { label: 'Escalated', value: String(stats.escalated), sub: 'Needs attention', icon: Flame, gradient: 'from-red-500 to-pink-500', bg: 'bg-red-500/10', glow: 'shadow-red-500/20' },
  ];

  const quickLinks = [
    { label: 'Complaint Queue', desc: `${stats.escalated} escalated, ${stats.complaints} open`, path: '/admin/complaints', gradient: 'from-red-500 to-orange-500', icon: Flame },
    { label: 'Room Allocation', desc: `${stats.available} rooms available`, path: '/admin/allocation', gradient: 'from-green-500 to-emerald-500', icon: BedDouble },
    { label: 'Payment Tracking', desc: `₹${paymentSummary.overdue} overdue`, path: '/admin/payments', gradient: 'from-yellow-500 to-amber-500', icon: CreditCard },
    { label: 'Staff Management', desc: 'Manage hostel staff', path: '/admin/staff', gradient: 'from-purple-500 to-violet-500', icon: UserCog },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={item}>
        <div className="flex items-center gap-2 text-primary-400 text-sm font-medium mb-1">
          <Shield className="w-4 h-4" /> Admin Dashboard
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-400">{user?.first_name || 'Admin'}</span>
        </h1>
        <p className="text-gray-500 mt-2">System metrics and hostel analytics at a glance.</p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div key={idx} whileHover={{ y: -4, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}
              className={`relative overflow-hidden rounded-2xl glass glass-hover p-5 shadow-lg ${stat.glow}`}>
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

      {/* Revenue Summary */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Collected', amount: paymentSummary.collected, gradient: 'from-green-500 to-emerald-500', icon: TrendingUp },
          { label: 'Pending', amount: paymentSummary.pending, gradient: 'from-yellow-500 to-amber-500', icon: Clock },
          { label: 'Overdue', amount: paymentSummary.overdue, gradient: 'from-red-500 to-pink-500', icon: AlertTriangle },
        ].map((rev, idx) => {
          const Icon = rev.icon;
          return (
            <div key={idx} className="glass rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${rev.gradient} flex items-center justify-center shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">₹{Number(rev.amount).toLocaleString()}</div>
                <div className="text-xs text-gray-500">{rev.label}</div>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Quick Links + Recent Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="space-y-3">
          <h2 className="text-lg font-bold text-white px-1">Quick Access</h2>
          {quickLinks.map((link, idx) => {
            const Icon = link.icon;
            return (
              <Link key={idx} to={link.path}>
                <motion.div whileHover={{ x: 4, scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-4 p-4 rounded-2xl glass glass-hover group hover-target mb-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${link.gradient} flex items-center justify-center shadow-lg shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white group-hover:text-primary-400 transition-colors">{link.label}</div>
                    <div className="text-xs text-gray-500">{link.desc}</div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-primary-400 transition-all" />
                </motion.div>
              </Link>
            );
          })}
        </motion.div>

        <motion.div variants={item} className="lg:col-span-2 glass rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Open Complaints</h2>
            <Link to="/admin/complaints" className="text-xs text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1 hover-target">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['ID', 'Student', 'Issue', 'Priority', 'Action'].map(h => (
                    <th key={h} className="py-3 px-5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentComplaints.map(c => (
                  <tr key={c.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-5 font-mono text-xs text-gray-500">#{c.id}</td>
                    <td className="py-3.5 px-5 text-sm text-gray-300">{c.filed_by_detail?.full_name}</td>
                    <td className="py-3.5 px-5 text-sm text-gray-300 max-w-[200px] truncate">{c.title}</td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                        c.priority === 'high' ? 'bg-red-500/15 text-red-400' :
                        c.priority === 'medium' ? 'bg-orange-500/15 text-orange-400' :
                        'bg-green-500/15 text-green-400'
                      }`}>{c.priority}</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <Link to="/admin/complaints" className="text-primary-400 hover:text-primary-300 text-xs font-medium hover-target">Manage →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
