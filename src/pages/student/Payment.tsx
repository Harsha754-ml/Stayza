import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle2, Clock, AlertTriangle, Wallet } from 'lucide-react';
import { paymentService } from '../../services/api';

interface PaymentRecord {
  id: number;
  amount: string;
  month: string;
  status: string;
  method: string;
  due_date: string;
  paid_date: string | null;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  paid: { label: 'Paid', color: 'text-green-400', bg: 'bg-green-500/20', icon: CheckCircle2 },
  pending: { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: Clock },
  overdue: { label: 'Overdue', color: 'text-red-400', bg: 'bg-red-500/20', icon: AlertTriangle },
};

const Payment: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [payMethod, setPayMethod] = useState<'card' | 'upi'>('card');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    paymentService.mine().then(res => {
      setPayments(res.data.results || res.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handlePay = async (id: number) => {
    setPayingId(id);
    try {
      await paymentService.markPaid(id, payMethod);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      const res = await paymentService.mine();
      setPayments(res.data.results || res.data);
    } catch (err) { console.error(err); }
    finally { setPayingId(null); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>;
  }

  const pendingPayments = payments.filter(p => p.status !== 'paid');
  const paidPayments = payments.filter(p => p.status === 'paid');

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Payments</h1>
        <p className="text-gray-400">View your payment history and pay pending dues.</p>
      </div>

      {success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="text-green-300 font-medium">Payment successful!</span>
        </motion.div>
      )}

      {/* Payment method selector */}
      <div className="flex gap-4">
        <button onClick={() => setPayMethod('card')}
          className={`flex-1 py-4 px-6 rounded-xl border flex items-center justify-center gap-2 transition-all hover-target ${
            payMethod === 'card' ? 'bg-primary-500/10 border-primary-500 text-primary-400' : 'bg-black/50 border-white/10 text-gray-400 hover:bg-white/5'
          }`}>
          <CreditCard className="w-5 h-5" /> Card
        </button>
        <button onClick={() => setPayMethod('upi')}
          className={`flex-1 py-4 px-6 rounded-xl border flex items-center justify-center gap-2 transition-all hover-target ${
            payMethod === 'upi' ? 'bg-primary-500/10 border-primary-500 text-primary-400' : 'bg-black/50 border-white/10 text-gray-400 hover:bg-white/5'
          }`}>
          <Wallet className="w-5 h-5" /> UPI
        </button>
      </div>

      {/* Pending Payments */}
      {pendingPayments.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Pending / Overdue</h2>
          <div className="space-y-3">
            {pendingPayments.map(p => {
              const cfg = statusConfig[p.status] || statusConfig.pending;
              const StatusIcon = cfg.icon;
              return (
                <div key={p.id} className="bg-surface/50 border border-white/5 p-5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />{cfg.label}
                    </span>
                    <div>
                      <div className="text-white font-medium">{p.month}</div>
                      <div className="text-xs text-gray-500">Due: {p.due_date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-white">₹{Number(p.amount).toLocaleString()}</span>
                    <button onClick={() => handlePay(p.id)} disabled={payingId === p.id}
                      className="px-5 py-2 bg-primary-500 hover:bg-primary-400 text-black font-bold rounded-xl transition-all hover-target disabled:opacity-50">
                      {payingId === p.id ? 'Processing...' : 'Pay Now'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Payment History</h2>
        {paidPayments.length === 0 ? (
          <p className="text-gray-500">No payment history yet.</p>
        ) : (
          <div className="bg-surface/50 border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  {['Month', 'Amount', 'Method', 'Paid Date', 'Status'].map(h => (
                    <th key={h} className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paidPayments.map(p => (
                  <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-white">{p.month}</td>
                    <td className="py-3 px-4 text-white font-bold">₹{Number(p.amount).toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-400 capitalize">{p.method || '—'}</td>
                    <td className="py-3 px-4 text-gray-400">{p.paid_date || '—'}</td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
                        <CheckCircle2 className="w-3 h-3" /> Paid
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Payment;
