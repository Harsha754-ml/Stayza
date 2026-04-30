import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bed, AlertCircle, CreditCard, Star, ArrowRight, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { roomService, complaintService, paymentService, feedbackService } from '../../services/api';

const useCountUp = (end: number, duration = 800) => {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true });
  useEffect(() => {
    if (!inView || end === 0) { setVal(end); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      setVal(Math.round(eased * end));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, end, duration]);
  return { val, ref };
};

interface DashData {
  roomNumber: string; roomType: string; activeComplaints: number;
  pendingDues: number; pendingFeedback: number;
  recentComplaints: Array<{ id: number; title: string; status: string; priority: string; created_at: string }>;
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashData>({
    roomNumber: '—', roomType: '', activeComplaints: 0, pendingDues: 0, pendingFeedback: 0, recentComplaints: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
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
          recentComplaints: complaints.slice(0, 5),
        });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const cComplaints = useCountUp(data.activeComplaints);
  const cDues = useCountUp(data.pendingDues);
  const cFeedback = useCountUp(data.pendingFeedback);

  if (loading) {
    return <div className="space-y-6"><div className="skeleton h-10 w-48" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}</div></div>;
  }

  const statCards = [
    { label: 'Your Room', value: data.roomNumber, isText: true, icon: Bed },
    { label: 'Open Complaints', counter: cComplaints, icon: AlertCircle, danger: data.activeComplaints > 0 },
    { label: 'Pending Dues', counter: cDues, icon: CreditCard, prefix: '₹', danger: data.pendingDues > 0 },
    { label: 'Feedback', counter: cFeedback, icon: Star },
  ];

  const quickLinks = [
    { label: 'Book a room', desc: 'Find your ideal space', path: '/student/rooms', icon: Bed },
    { label: 'Report an issue', desc: 'File a complaint', path: '/student/complaints', icon: AlertCircle },
    { label: 'Pay dues', desc: 'Clear pending payments', path: '/student/payment', icon: CreditCard },
    { label: 'Find roommate', desc: 'AI-powered matching', path: '/student/roommates', icon: Star },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="text-[11px] font-medium tracking-[0.08em] uppercase text-text-2 mb-2">Student Dashboard</div>
        <h1 className="text-[28px] text-text-1 leading-tight">
          <span className="font-semibold">Welcome back, </span>
          <span className="font-[family-name:var(--font-display)] italic">{user?.first_name || 'there'}</span>
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={`animate-card-in card px-6 py-5 ${'danger' in s && s.danger ? 'border-yellow/20' : ''}`}
              style={{ animationDelay: `${i * 60}ms` }}>
              <Icon className="w-4 h-4 text-text-2 mb-3" strokeWidth={1.5} />
              {'isText' in s ? (
                <span className="block text-[40px] font-semibold tabular-nums leading-none mb-1.5 text-text-1">{s.value}</span>
              ) : (
                <span ref={s.counter?.ref}
                  className={`block text-[40px] font-semibold tabular-nums leading-none mb-1.5 ${'danger' in s && s.danger ? 'text-yellow' : 'text-text-1'}`}>
                  {'prefix' in s ? s.prefix : ''}{s.counter?.val.toLocaleString()}
                </span>
              )}
              <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-text-2">{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Quick access + Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick access */}
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

        {/* Recent complaints */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-5 h-11 bg-overlay border-b border-border">
            <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-text-2">Recent complaints</span>
            <Link to="/student/complaints" className="text-[13px] font-medium text-accent hover:underline">View all →</Link>
          </div>
          {data.recentComplaints.length === 0 ? (
            <div className="px-5 py-10 text-center text-[13px] text-text-2">No complaints yet — that's a good sign.</div>
          ) : (
            <div>
              {data.recentComplaints.map((c, i) => (
                <div key={c.id} className={`flex items-center gap-3 h-[52px] px-5 hover:bg-overlay transition-colors duration-150 ${
                  i < data.recentComplaints.length - 1 ? 'border-b border-border' : ''
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    c.status === 'resolved' ? 'bg-green' : c.status === 'in_progress' ? 'bg-yellow' : 'bg-accent'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-[14px] font-medium text-text-1 truncate block">{c.title}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-text-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" strokeWidth={1.5} />{new Date(c.created_at).toLocaleDateString()}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase ${
                      c.priority === 'high' ? 'bg-red-bg text-red' :
                      c.priority === 'medium' ? 'bg-yellow-bg text-yellow' : 'bg-green-bg text-green'
                    }`}>{c.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
