import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BedDouble, AlertTriangle, CreditCard, UserCog, ArrowRight, Flame, TrendingUp, Clock, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { roomService, complaintService, paymentService } from '../../services/api';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ rooms: 0, available: 0, complaints: 0, escalated: 0 });
  const [pay, setPay] = useState({ collected: 0, pending: 0, overdue: 0 });
  const [complaints, setComplaints] = useState<Array<{
    id: number; title: string; priority: string; status: string;
    filed_by_detail: { full_name: string };
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [rRes, cRes, pRes] = await Promise.all([
          roomService.list(), complaintService.list(), paymentService.summary(),
        ]);
        const rooms = rRes.data.results || rRes.data;
        const comps = cRes.data.results || cRes.data;
        setStats({
          rooms: rooms.length,
          available: rooms.filter((r: { status: string }) => r.status === 'available').length,
          complaints: comps.filter((c: { status: string }) => c.status !== 'resolved').length,
          escalated: comps.filter((c: { escalated: boolean }) => c.escalated).length,
        });
        setPay({ collected: pRes.data.collected.amount, pending: pRes.data.pending.amount, overdue: pRes.data.overdue.amount });
        setComplaints(comps.filter((c: { status: string }) => c.status !== 'resolved').slice(0, 5));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) {
    return <div className="space-y-6"><div className="skeleton h-10 w-48" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="skeleton h-28 rounded-xl" />)}</div></div>;
  }

  const statCards = [
    { label: 'Total Rooms', value: stats.rooms, icon: BedDouble, color: 'text-info' },
    { label: 'Available', value: stats.available, icon: BedDouble, color: 'text-success' },
    { label: 'Open Complaints', value: stats.complaints, icon: AlertTriangle, color: 'text-warning' },
    { label: 'Escalated', value: stats.escalated, icon: Flame, color: 'text-danger' },
  ];

  const revenue = [
    { label: 'Collected', amount: pay.collected, icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Pending', amount: pay.pending, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Overdue', amount: pay.overdue, icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/10' },
  ];

  const links = [
    { label: 'Complaint Queue', desc: `${stats.escalated} escalated, ${stats.complaints} open`, path: '/admin/complaints', icon: Flame },
    { label: 'Room Allocation', desc: `${stats.available} rooms available`, path: '/admin/allocation', icon: BedDouble },
    { label: 'Payment Tracking', desc: `₹${pay.overdue} overdue`, path: '/admin/payments', icon: CreditCard },
    { label: 'Staff Management', desc: 'Manage hostel staff', path: '/admin/staff', icon: UserCog },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2 text-accent text-sm font-medium mb-1">
          <Shield className="w-4 h-4" /> Admin Dashboard
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-text-1">
          Welcome, <span className="text-accent italic">{user?.first_name || 'Admin'}</span>
        </h1>
        <p className="text-text-2 mt-1">System overview and hostel analytics.</p>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="card p-5">
              <div className={`w-9 h-9 rounded-lg bg-accent-bg border border-accent/20 flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className="font-[family-name:var(--font-display)] text-2xl text-text-1">{s.value}</div>
              <div className="text-[11px] font-medium text-text-3 uppercase tracking-wide mt-0.5">{s.label}</div>
            </div>
          );
        })}
      </motion.div>

      {/* Revenue */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {revenue.map((r, i) => {
          const Icon = r.icon;
          return (
            <div key={i} className="card p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl ${r.bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${r.color}`} />
              </div>
              <div>
                <div className="font-[family-name:var(--font-display)] text-xl text-text-1">₹{Number(r.amount).toLocaleString()}</div>
                <div className="text-[11px] text-text-3 uppercase tracking-wide">{r.label}</div>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Quick links + complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div variants={item} className="space-y-2">
          <h2 className="text-base font-semibold text-text-1 px-1 mb-2">Quick access</h2>
          {links.map((l, i) => {
            const Icon = l.icon;
            return (
              <Link key={i} to={l.path}>
                <motion.div whileTap={{ scale: 0.98 }}
                  className="card p-4 flex items-center gap-3 group hover-target mb-2">
                  <div className="w-9 h-9 rounded-lg bg-accent-bg border border-accent/20 flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:border-accent transition-all">
                    <Icon className="w-4 h-4 text-accent group-hover:text-bg transition-colors" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-text-1 group-hover:text-accent transition-colors">{l.label}</div>
                    <div className="text-[11px] text-text-3">{l.desc}</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-text-3 group-hover:text-accent transition-all" />
                </motion.div>
              </Link>
            );
          })}
        </motion.div>

        <motion.div variants={item} className="lg:col-span-2 card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-1">Open complaints</h2>
            <Link to="/admin/complaints" className="text-xs text-accent font-medium flex items-center gap-1 hover:text-accent-dim transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  {['ID', 'Student', 'Issue', 'Priority', ''].map(h => (
                    <th key={h} className="py-3 px-4 text-[10px] font-semibold text-text-3 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {complaints.length === 0 ? (
                  <tr><td colSpan={5} className="py-10 text-center text-text-3 text-sm">No open complaints</td></tr>
                ) : complaints.map(c => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface-2 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-text-3">#{c.id}</td>
                    <td className="py-3 px-4 text-sm text-text-1">{c.filed_by_detail?.full_name}</td>
                    <td className="py-3 px-4 text-sm text-text-2 max-w-[180px] truncate">{c.title}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        c.priority === 'high' ? 'bg-danger/10 text-danger' :
                        c.priority === 'medium' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                      }`}>{c.priority}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Link to="/admin/complaints" className="text-xs text-accent font-medium hover:text-accent-dim">Manage →</Link>
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
