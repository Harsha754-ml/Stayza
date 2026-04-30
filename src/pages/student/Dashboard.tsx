import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Bed, AlertCircle, CreditCard, Star, ArrowRight, Clock, Check, DoorOpen } from 'lucide-react';
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
  roomNumber: string; roomType: string; roomFloor: number; roomPrice: string;
  roomId: number | null; bookingId: number | null; hasActiveBooking: boolean;
  activeComplaints: number; pendingDues: number; pendingFeedback: number;
  recentComplaints: Array<{ id: number; title: string; status: string; priority: string; created_at: string }>;
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState<DashData>({
    roomNumber: '—', roomType: '', roomFloor: 0, roomPrice: '0',
    roomId: null, bookingId: null, hasActiveBooking: false,
    activeComplaints: 0, pendingDues: 0, pendingFeedback: 0, recentComplaints: [],
  });
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);

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
        roomFloor: active?.room_detail?.floor || 0,
        roomPrice: active?.room_detail?.price_per_month || '0',
        roomId: active?.room_detail?.id || null,
        bookingId: active?.id || null,
        hasActiveBooking: !!active,
        activeComplaints: complaints.filter((c: { status: string }) => c.status !== 'resolved').length,
        pendingDues: payments.filter((p: { status: string }) => p.status !== 'paid').reduce((s: number, p: { amount: number | string }) => s + Number(p.amount), 0),
        pendingFeedback: fRes.data.length || 0,
        recentComplaints: complaints.slice(0, 5),
      });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

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

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      await roomService.checkout();
      setCheckedOut(true);
      // After 3 seconds, redirect to feedback page
      setTimeout(() => navigate('/student/feedback'), 3000);
    } catch (err) { console.error(err); }
    finally { setCheckingOut(false); }
  };

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

      {/* Current Room Card with Checkout */}
      <AnimatePresence>
        {data.hasActiveBooking && !checkedOut && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
            className="card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent-glow flex items-center justify-center">
                  <Bed className="w-6 h-6 text-accent" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-[11px] font-medium tracking-[0.08em] uppercase text-text-2 mb-0.5">Your current room</div>
                  <div className="text-[18px] font-semibold text-text-1">Room {data.roomNumber}</div>
                  <div className="text-[13px] text-text-2 capitalize">{data.roomType} · Floor {data.roomFloor} · ₹{Number(data.roomPrice).toLocaleString()}/mo</div>
                </div>
              </div>
              <button onClick={handleCheckout} disabled={checkingOut}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-red/30 text-red hover:bg-red-bg hover:border-red/50 transition-all duration-200 text-[13px] font-medium disabled:opacity-50">
                <DoorOpen className="w-4 h-4" strokeWidth={1.5} />
                {checkingOut ? 'Checking out...' : 'Check out'}
              </button>
            </div>
          </motion.div>
        )}
        {checkedOut && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="card p-6 border-green/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-bg flex items-center justify-center">
                <Check className="w-6 h-6 text-green" strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-[16px] font-semibold text-text-1">Checked out successfully!</div>
                <div className="text-[13px] text-text-2">Redirecting to feedback page — rate your roommate before you go...</div>
              </div>
            </div>
          </motion.div>
        )}
        {!data.hasActiveBooking && !checkedOut && (
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-overlay flex items-center justify-center">
                  <Bed className="w-6 h-6 text-text-3" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-[16px] font-semibold text-text-1">No room booked yet</div>
                  <div className="text-[13px] text-text-2">Find and book your ideal room to get started.</div>
                </div>
              </div>
              <Link to="/student/rooms"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white hover:bg-accent-dim transition-all duration-200 text-[13px] font-semibold">
                Book a room <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        )}
      </AnimatePresence>

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
