import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertTriangle, Search } from 'lucide-react';
import { paymentService } from '../../services/api';

interface Payment {
  id: number;
  user_detail: { id: number; full_name: string; username: string };
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

const AdminPayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState({ collected: { amount: 0, count: 0 }, pending: { amount: 0, count: 0 }, overdue: { amount: 0, count: 0 } });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [payRes, sumRes] = await Promise.all([paymentService.list(), paymentService.summary()]);
        setPayments(payRes.data.results || payRes.data);
        setSummary(sumRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleMarkPaid = async (id: number) => {
    try {
      await paymentService.markPaid(id, 'cash');
      const [payRes, sumRes] = await Promise.all([paymentService.list(), paymentService.summary()]);
      setPayments(payRes.data.results || payRes.data);
      setSummary(sumRes.data);
    } catch (err) { console.error(err); }
  };

  const filtered = payments
    .filter(p => filter === 'all' || p.status === filter)
    .filter(p => !search || p.user_detail.full_name.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Payment Tracking</h1>
        <p className="text-gray-400">Monitor rent collection, pending dues, and overdue accounts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2"><CheckCircle2 className="w-5 h-5 text-green-400" /><span className="text-sm text-green-400 font-medium">Collected</span></div>
          <div className="text-3xl font-bold text-white">₹{Number(summary.collected.amount).toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">{summary.collected.count} payments</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2"><Clock className="w-5 h-5 text-yellow-400" /><span className="text-sm text-yellow-400 font-medium">Pending</span></div>
          <div className="text-3xl font-bold text-white">₹{Number(summary.pending.amount).toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">{summary.pending.count} payments</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-5 h-5 text-red-400" /><span className="text-sm text-red-400 font-medium">Overdue</span></div>
          <div className="text-3xl font-bold text-white">₹{Number(summary.overdue.amount).toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">{summary.overdue.count} accounts</div>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap items-center justify-between">
        <div className="flex gap-2">
          {['all', 'paid', 'pending', 'overdue'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all hover-target capitalize ${
                filter === f ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
              }`}>{f === 'all' ? 'All' : f}</button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student..."
            className="bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" />
        </div>
      </div>

      <div className="bg-surface/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                {['ID', 'Student', 'Month', 'Amount', 'Due Date', 'Status', 'Method', 'Actions'].map(h => (
                  <th key={h} className="py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const sc = statusConfig[p.status] || statusConfig.pending;
                const StatusIcon = sc.icon;
                return (
                  <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-mono text-xs text-gray-500">#{p.id}</td>
                    <td className="py-4 px-4 text-white font-medium text-sm">{p.user_detail.full_name}</td>
                    <td className="py-4 px-4 text-gray-400 text-sm">{p.month}</td>
                    <td className="py-4 px-4 text-white font-bold">₹{Number(p.amount).toLocaleString()}</td>
                    <td className="py-4 px-4 text-gray-400 text-sm">{p.due_date}</td>
                    <td className="py-4 px-4">
                      <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.color}`}>
                        <StatusIcon className="w-3 h-3" />{sc.label}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-400 text-sm capitalize">{p.method || '—'}</td>
                    <td className="py-4 px-4">
                      {p.status !== 'paid' && (
                        <button onClick={() => handleMarkPaid(p.id)}
                          className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/20 rounded-lg text-xs font-medium transition-all hover-target whitespace-nowrap">
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="py-16 text-center text-gray-500">No payments match current filters.</div>}
      </div>
    </motion.div>
  );
};

export default AdminPayments;
