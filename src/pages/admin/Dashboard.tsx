import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';
import { BedDouble, AlertTriangle, CreditCard, UserCog, ArrowRight, Flame, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { roomService, complaintService, paymentService } from '../../services/api';

/* ── Count-up hook ── */
const useCountUp = (end: number, duration = 800) => {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true });
  useEffect(() => {
    if (!inView || end === 0) { setVal(end); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4); // easeOutExpo approx
      setVal(Math.round(eased * end));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, end, duration]);
  return { val, ref };
};

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
          rooms: rooms.length, available: rooms.filter((r: { status: string }) => r.status === 'available').length,
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

  // Count-up refs
  const cRooms = useCountUp(stats.rooms);
  const cAvail = useCountUp(stats.available);
  const cComps = useCountUp(stats.complaints);
  const cEsc = useCountUp(stats.escalated);
  const cCollected = useCountUp(pay.collected);
  const cPending = useCountUp(pay.pending);
  const cOverdue = useCountUp(pay.overdue);

  if (loading) {
    return <div className="space-y-6"><div className="skeleton h-10 w-48" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}</div></div>;
  }

  const statCards = [
    { label: 'Total Rooms', counter: cRooms, icon: BedDouble, danger: false },
    { label: 'Available', counter: cAvail, icon: BedDouble, danger: false },
    { label: 'Open Complaints', counter: cComps, icon: AlertTriangle, danger: false },
    { label: 'Escalated', counter: cEsc, icon: Flame, danger: stats.escalated > 0 },
  ];

  const revenueCards = [
    { label: 'Collected', counter: cCollected, color: 'text-green', dot: 'bg-green', prefix: '₹' },
    { label: 'Pending', counter: cPending, color: 'text-yellow', dot: 'bg-yellow', prefix: '₹' },
    { label: 'Overdue', counter: cOverdue, color: 'text-red', dot: 'bg-red', prefix: '₹' },
  ];

  const quickLinks = [
    { label: 'Complaint Queue', desc: `${stats.escalated} escalated, ${stats.complaints} open`, path: '/admin/complaints', icon: Flame },
    { label: 'Room Allocation', desc: `${stats.available} rooms available`, path: '/admin/allocation', icon: BedDouble },
    { label: 'Payment Tracking', desc: `₹${pay.overdue} overdue`, path: '/admin/payments', icon: CreditCard },
    { label: 'Staff Management', desc: 'Manage hostel staff', path: '/admin/staff', icon: UserCog },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-text-2 text-[11px] font-medium tracking-[0.08em] uppercase mb-2">
          <Shield className="w-3.5 h-3.5" strokeWidth={1.5} /> Admin Dashboard
        </div>
        <h1 className="text-[28px] text-text-1 leading-tight">
          <span className="font-[family-name:var(--font-sans)] font-semibold">Welcome, </span>
          <span className="font-[family-name:var(--font-display)] italic">{user?.first_name || 'Admin'}</span>
        </h1>
      </div>

      {/* Stat cards — staggered entrance */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={`animate-card-in card px-6 py-5 ${s.danger ? 'border-red/30' : ''}`}
              style={{ animationDelay: `${i * 60}ms` }}>
              <Icon className="w-4 h-4 text-text-2 mb-3" strokeWidth={1.5} />
              <span ref={s.counter.ref}
                className={`block text-[40px] font-semibold tabular-nums leading-none mb-1.5 ${s.danger ? 'text-red' : 'text-text-1'}`}>
                {s.counter.val}
              </span>
              <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-text-2">{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Revenue row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {revenueCards.map((r, i) => (
          <div key={i} className="animate-card-in card px-6 py-5" style={{ animationDelay: `${(i + 4) * 60}ms` }}>
            <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-text-2 mb-3 block">{r.label}</span>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${r.dot}`} />
              <span ref={r.counter.ref} className={`text-[40px] font-semibold tabular-nums leading-none ${r.color}`}>
                {r.prefix}{r.counter.val.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick access + Complaints table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick access list */}
        <div className="card overflow-hidden">
          {quickLinks.map((l, i) => {
            const Icon = l.icon;
            return (
              <Link key={i} to={l.path}>
                <div className={`flex items-center gap-3 h-14 px-5 group transition-colors duration-150 hover:bg-overlay ${
                  i < quickLinks.length - 1 ? 'border-b border-border' : ''
                }`}>
                  <div className="w-8 h-8 rounded-lg bg-overlay flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-text-2" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-text-1">{l.label}</div>
                    <div className="text-[12px] text-text-2">{l.desc}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-text-3 group-hover:translate-x-1 transition-transform duration-200" strokeWidth={1.5} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Complaints table */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-5 h-11 bg-overlay border-b border-border">
            <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-text-2">Open complaints</span>
            <Link to="/admin/complaints" className="text-[13px] font-medium text-accent hover:underline">View all →</Link>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                {['ID', 'Student', 'Issue', 'Priority', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-[11px] font-medium tracking-[0.08em] uppercase text-text-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-[13px] text-text-2">No open complaints</td></tr>
              ) : complaints.map(c => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-overlay transition-colors duration-150">
                  <td className="px-5 h-[52px] font-mono text-[13px] text-text-3">#{c.id}</td>
                  <td className="px-5 h-[52px] text-[14px] font-medium text-text-1">{c.filed_by_detail?.full_name}</td>
                  <td className="px-5 h-[52px] text-[13px] text-text-2 max-w-[200px] truncate">{c.title}</td>
                  <td className="px-5 h-[52px]">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase ${
                      c.priority === 'high' ? 'bg-red-bg text-red' :
                      c.priority === 'medium' ? 'bg-yellow-bg text-yellow' :
                      'bg-green-bg text-green'
                    }`}>{c.priority}</span>
                  </td>
                  <td className="px-5 h-[52px]">
                    <Link to="/admin/complaints" className="text-[13px] font-medium text-accent hover:underline">Manage →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
