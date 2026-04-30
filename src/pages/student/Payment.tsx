import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertTriangle, CreditCard, Wallet, IndianRupee } from 'lucide-react';
import { paymentService, roomService } from '../../services/api';

interface PaymentRecord {
  id: number; amount: string; month: string; status: string;
  method: string; due_date: string; paid_date: string | null;
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const Payment: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [payMethod, setPayMethod] = useState<'card' | 'upi'>('card');
  const [success, setSuccess] = useState(false);
  const [roomInfo, setRoomInfo] = useState<{ number: string; price: string } | null>(null);
  const [quickPayDone, setQuickPayDone] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [payRes, bookRes] = await Promise.all([paymentService.mine(), roomService.myBookings()]);
        setPayments(payRes.data.results || payRes.data);
        const bookings = bookRes.data.results || bookRes.data;
        const active = bookings.find((b: { is_active: boolean }) => b.is_active);
        if (active?.room_detail) setRoomInfo({ number: active.room_detail.number, price: active.room_detail.price_per_month });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handlePay = async (id: number) => {
    setPayingId(id);
    try {
      await paymentService.markPaid(id, payMethod);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      const res = await paymentService.mine();
      setPayments(res.data.results || res.data);
    } catch (err) { console.error(err); }
    finally { setPayingId(null); }
  };

  const handleQuickPay = () => {
    setQuickPayDone(true);
    setTimeout(() => setQuickPayDone(false), 4000);
  };

  if (loading) return <div className="skeleton h-40 rounded-xl" />;

  const pending = payments.filter(p => p.status !== 'paid');
  const paid = payments.filter(p => p.status === 'paid');

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-4xl">
      <motion.div variants={item}>
        <p className="text-sm text-text-3 mb-1">Payments</p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-text-1">Your payments</h1>
      </motion.div>

      {success && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <span className="text-success font-medium text-sm">Payment successful!</span>
        </motion.div>
      )}
      {quickPayDone && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <span className="text-success font-medium text-sm">Payment of ₹{roomInfo ? Number(roomInfo.price).toLocaleString() : '0'} received! Thank you.</span>
        </motion.div>
      )}

      {/* Payment method */}
      <motion.div variants={item} className="flex gap-3">
        {[
          { key: 'card' as const, label: 'Card', icon: CreditCard },
          { key: 'upi' as const, label: 'UPI', icon: Wallet },
        ].map(m => (
          <button key={m.key} onClick={() => setPayMethod(m.key)}
            className={`flex-1 py-3 px-5 rounded-xl border flex items-center justify-center gap-2 text-sm font-medium transition-all ${
              payMethod === m.key ? 'bg-accent-bg border-accent/30 text-accent' : 'bg-surface border-border text-text-2 hover:border-border-light'
            }`}>
            <m.icon className="w-4 h-4" /> {m.label}
          </button>
        ))}
      </motion.div>

      {/* Quick pay — for hackathon demo */}
      {roomInfo && (
        <motion.div variants={item} className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-1">Room {roomInfo.number} — Monthly Rent</h3>
              <p className="text-sm text-text-2 mt-1">Pay your current month's rent in one click</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-2xl font-bold text-text-1">
                <IndianRupee className="w-5 h-5" />{Number(roomInfo.price).toLocaleString()}
              </div>
              <div className="text-[11px] text-text-3">per month</div>
            </div>
          </div>
          <button onClick={handleQuickPay} disabled={quickPayDone}
            className="w-full mt-5 flex items-center justify-center gap-2 bg-accent text-bg font-semibold text-sm py-3 rounded-lg hover:bg-accent-dim hover:scale-[1.01] transition-all disabled:opacity-50">
            {quickPayDone ? <><CheckCircle2 className="w-4 h-4" /> Paid!</> : <><CreditCard className="w-4 h-4" /> Pay ₹{Number(roomInfo.price).toLocaleString()} now</>}
          </button>
        </motion.div>
      )}

      {/* Pending from backend */}
      {pending.length > 0 && (
        <motion.div variants={item}>
          <h2 className="text-base font-semibold text-text-1 mb-3">Pending dues</h2>
          <div className="space-y-2">
            {pending.map(p => (
              <div key={p.id} className="card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    p.status === 'overdue' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'
                  }`}>
                    {p.status === 'overdue' ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-1">{p.month}</div>
                    <div className="text-[11px] text-text-3">Due: {p.due_date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-text-1">₹{Number(p.amount).toLocaleString()}</span>
                  <button onClick={() => handlePay(p.id)} disabled={payingId === p.id}
                    className="px-4 py-2 bg-accent text-bg font-semibold text-xs rounded-lg hover:bg-accent-dim transition-all disabled:opacity-50">
                    {payingId === p.id ? 'Paying...' : 'Pay now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* History */}
      <motion.div variants={item}>
        <h2 className="text-base font-semibold text-text-1 mb-3">Payment history</h2>
        {paid.length === 0 && pending.length === 0 && !roomInfo ? (
          <div className="card p-10 text-center text-text-3 text-sm">No payments yet. Book a room first!</div>
        ) : paid.length === 0 ? (
          <div className="card p-10 text-center text-text-3 text-sm">No completed payments yet.</div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  {['Month', 'Amount', 'Method', 'Paid', 'Status'].map(h => (
                    <th key={h} className="py-3 px-4 text-[10px] font-semibold text-text-3 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paid.map(p => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface-2 transition-colors">
                    <td className="py-3 px-4 text-sm text-text-1">{p.month}</td>
                    <td className="py-3 px-4 text-sm font-bold text-text-1">₹{Number(p.amount).toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-text-2 capitalize">{p.method || '—'}</td>
                    <td className="py-3 px-4 text-sm text-text-2">{p.paid_date || '—'}</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-success/10 text-success uppercase">Paid</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Payment;
