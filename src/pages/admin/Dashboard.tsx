import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, BedDouble, AlertTriangle, CreditCard, UserCog, ArrowRight, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { roomService, complaintService, paymentService } from '../../services/api';

const AdminDashboard: React.FC = () => {
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
          roomService.list(),
          complaintService.list(),
          paymentService.summary(),
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
        setRecentComplaints(complaints.filter((c: { status: string }) => c.status !== 'resolved').slice(0, 4));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>;
  }

  const statCards = [
    { label: 'Total Rooms', value: String(stats.rooms), icon: BedDouble, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Available Rooms', value: String(stats.available), icon: BedDouble, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Open Complaints', value: String(stats.complaints), icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { label: 'Escalated', value: String(stats.escalated), icon: Flame, color: 'text-red-400', bg: 'bg-red-400/10' },
  ];

  const quickLinks = [
    { label: 'Complaint Queue', desc: `${stats.escalated} escalated, ${stats.complaints} open`, path: '/admin/complaints', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: Flame },
    { label: 'Room Allocation', desc: `${stats.available} rooms available`, path: '/admin/allocation', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: BedDouble },
    { label: 'Payment Tracking', desc: `₹${paymentSummary.overdue} overdue`, path: '/admin/payments', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: CreditCard },
    { label: 'Staff Management', desc: 'Manage staff', path: '/admin/staff', color: 'text-primary-400', bg: 'bg-primary-500/10', border: 'border-primary-500/20', icon: UserCog },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Admin Overview</h1>
        <p className="text-gray-400">System metrics and hostel analytics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-surface/50 border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} w-fit mb-4`}><Icon className="w-6 h-6" /></div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickLinks.map((link, idx) => {
          const Icon = link.icon;
          return (
            <Link key={idx} to={link.path}>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.08 }}
                className={`flex items-center gap-4 p-5 rounded-2xl border ${link.bg} ${link.border} hover:scale-[1.02] transition-all hover-target group`}>
                <div className="p-3 rounded-xl bg-black/20"><Icon className={`w-6 h-6 ${link.color}`} /></div>
                <div className="flex-1">
                  <div className={`font-bold ${link.color}`}>{link.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{link.desc}</div>
                </div>
                <ArrowRight className={`w-4 h-4 ${link.color} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
              </motion.div>
            </Link>
          );
        })}
      </div>

      <div className="bg-surface/50 border border-white/5 p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-6">Recent Open Complaints</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400">
                <th className="py-3 px-4 font-medium">ID</th>
                <th className="py-3 px-4 font-medium">Student</th>
                <th className="py-3 px-4 font-medium">Issue</th>
                <th className="py-3 px-4 font-medium">Priority</th>
                <th className="py-3 px-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentComplaints.map(c => (
                <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4 text-white font-mono text-sm">#{c.id}</td>
                  <td className="py-4 px-4 text-gray-300">{c.filed_by_detail?.full_name}</td>
                  <td className="py-4 px-4 text-gray-300">{c.title}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      c.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      c.priority === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>{c.priority}</span>
                  </td>
                  <td className="py-4 px-4">
                    <Link to="/admin/complaints" className="text-primary-400 hover:text-primary-300 text-sm font-medium hover-target">Manage →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
