import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, AlertCircle, Clock, CheckCircle2, User, ChevronDown, Filter } from 'lucide-react';
import { complaintService } from '../../services/api';
import { api } from '../../services/api';

interface Complaint {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  escalated: boolean;
  created_at: string;
  filed_by_detail: { id: number; full_name: string };
  assigned_to_detail: { id: number; full_name: string } | null;
}

interface StaffMember { id: number; full_name: string; username: string }

const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'text-blue-400', bg: 'bg-blue-500/20', icon: Clock },
  in_progress: { label: 'In Progress', color: 'text-orange-400', bg: 'bg-orange-500/20', icon: AlertCircle },
  resolved: { label: 'Resolved', color: 'text-green-400', bg: 'bg-green-500/20', icon: CheckCircle2 },
};

const AdminComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [openAssign, setOpenAssign] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes] = await Promise.all([complaintService.list()]);
        setComplaints(cRes.data.results || cRes.data);
        // Fetch staff users for assignment
        const staffRes = await api.get('/auth/profile/'); // We'll use a simpler approach
        // For now, we'll hardcode staff fetching via admin endpoint
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await api.get('/auth/staff/');
        setStaff(res.data);
      } catch { /* staff list optional */ }
    };
    fetchStaff();
  }, []);

  const handleAssign = async (complaintId: number, staffId: number) => {
    try {
      const res = await complaintService.assign(complaintId, staffId);
      setComplaints(prev => prev.map(c => c.id === complaintId ? res.data : c));
    } catch (err) { console.error(err); }
    setOpenAssign(null);
  };

  const handleResolve = async (complaintId: number) => {
    try {
      const res = await complaintService.resolve(complaintId);
      setComplaints(prev => prev.map(c => c.id === complaintId ? res.data : c));
    } catch (err) { console.error(err); }
  };

  const filtered = complaints
    .filter(c => filterStatus === 'all' || c.status === filterStatus)
    .filter(c => filterPriority === 'all' || c.priority === filterPriority)
    .sort((a, b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3));

  const escalated = complaints.filter(c => c.escalated).length;
  const open = complaints.filter(c => c.status === 'pending').length;
  const inProgress = complaints.filter(c => c.status === 'in_progress').length;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Complaint Queue</h1>
        <p className="text-gray-400">Priority-sorted complaint management. Auto-escalation after 48h.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Escalated', value: escalated, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Pending', value: open, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'In Progress', value: inProgress, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { label: 'Total', value: complaints.length, color: 'text-white', bg: 'bg-white/5' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border border-white/5 rounded-2xl p-4`}>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap items-center">
        <Filter className="w-4 h-4 text-gray-500" />
        <div className="flex gap-2">
          {['all', 'pending', 'in_progress', 'resolved'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover-target capitalize ${
                filterStatus === s ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
              }`}>{s === 'all' ? 'All Status' : s.replace('_', ' ')}</button>
          ))}
        </div>
        <div className="flex gap-2">
          {['all', 'high', 'medium', 'low'].map(p => (
            <button key={p} onClick={() => setFilterPriority(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover-target capitalize ${
                filterPriority === p ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
              }`}>{p === 'all' ? 'All Priority' : p}</button>
          ))}
        </div>
      </div>

      <div className="bg-surface/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                {['ID', 'Student', 'Issue', 'Priority', 'Status', 'Assigned To', 'Actions'].map(h => (
                  <th key={h} className="py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const sc = statusConfig[c.status] || statusConfig.pending;
                const StatusIcon = sc.icon;
                return (
                  <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-mono text-xs text-gray-400">#{c.id}</td>
                    <td className="py-4 px-4 text-white text-sm font-medium">{c.filed_by_detail?.full_name}</td>
                    <td className="py-4 px-4">
                      <div className="text-gray-300 text-sm max-w-[200px] truncate">{c.title}</div>
                      <div className="text-xs text-gray-500 capitalize">{c.category}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                        c.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        c.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>{c.priority}{c.escalated ? ' ⚡' : ''}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${sc.bg} ${sc.color}`}>
                        <StatusIcon className="w-3 h-3" />{sc.label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="relative">
                        <button onClick={() => setOpenAssign(openAssign === c.id ? null : c.id)}
                          className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors hover-target whitespace-nowrap">
                          <User className="w-3.5 h-3.5 text-primary-400" />
                          {c.assigned_to_detail?.full_name || 'Assign...'}
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        {openAssign === c.id && (
                          <div className="absolute top-full left-0 mt-1 z-30 bg-surface border border-white/10 rounded-xl shadow-2xl py-1 min-w-[180px]">
                            {staff.map(s => (
                              <button key={s.id} onClick={() => handleAssign(c.id, s.id)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                                {s.full_name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {c.status !== 'resolved' && (
                        <button onClick={() => handleResolve(c.id)}
                          className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/20 rounded-lg text-xs font-medium transition-all hover-target whitespace-nowrap">
                          Mark Resolved
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-500">No complaints match the current filters.</div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminComplaints;
