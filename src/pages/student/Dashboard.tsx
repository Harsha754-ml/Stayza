import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bed, AlertCircle, CreditCard, Activity } from 'lucide-react';
import { roomService, complaintService, paymentService } from '../../services/api';

interface DashboardData {
  roomNumber: string;
  activeComplaints: number;
  pendingDues: number;
  recentComplaints: Array<{ id: number; title: string; status: string; created_at: string }>;
}

const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>({
    roomNumber: '—', activeComplaints: 0, pendingDues: 0, recentComplaints: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, complaintsRes, paymentsRes] = await Promise.all([
          roomService.myBookings(),
          complaintService.mine(),
          paymentService.mine(),
        ]);

        const activeBooking = bookingsRes.data.results?.find((b: { is_active: boolean }) => b.is_active)
          || bookingsRes.data.find?.((b: { is_active: boolean }) => b.is_active);
        const complaints = complaintsRes.data.results || complaintsRes.data;
        const payments = paymentsRes.data.results || paymentsRes.data;

        const activeComplaints = complaints.filter(
          (c: { status: string }) => c.status !== 'resolved'
        ).length;
        const pendingDues = payments
          .filter((p: { status: string }) => p.status !== 'paid')
          .reduce((sum: number, p: { amount: number | string }) => sum + Number(p.amount), 0);

        setData({
          roomNumber: activeBooking?.room_detail?.number || '—',
          activeComplaints,
          pendingDues,
          recentComplaints: complaints.slice(0, 3),
        });
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Room Number', value: data.roomNumber, icon: Bed, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Active Complaints', value: String(data.activeComplaints), icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { label: 'Pending Dues', value: `₹${data.pendingDues}`, icon: CreditCard, color: 'text-red-400', bg: 'bg-red-400/10' },
    { label: 'Status', value: data.roomNumber !== '—' ? 'Allocated' : 'Unallocated', icon: Activity, color: 'text-green-400', bg: 'bg-green-400/10' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Overview</h1>
        <p className="text-gray-400">Welcome back. Here's what's happening with your accommodation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-surface/50 border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}><Icon className="w-6 h-6" /></div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface/50 border border-white/5 p-6 rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-6">Recent Complaints</h2>
          <div className="space-y-4">
            {data.recentComplaints.length === 0 ? (
              <p className="text-gray-500">No complaints filed yet.</p>
            ) : (
              data.recentComplaints.map((c) => (
                <div key={c.id} className="flex gap-4 border-b border-white/5 pb-4 last:border-0">
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary-500" />
                  <div>
                    <div className="text-white font-medium">{c.title}</div>
                    <div className="text-sm text-gray-400 mt-1 capitalize">{c.status.replace('_', ' ')}</div>
                    <div className="text-xs text-gray-500 mt-1">{new Date(c.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-surface/50 border border-white/5 p-6 rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/student/complaints">
              <button className="w-full bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 py-3 rounded-xl font-medium transition-all hover-target border border-primary-500/20">
                Submit Complaint
              </button>
            </Link>
            <Link to="/student/payment">
              <button className="w-full bg-white/5 text-white hover:bg-white/10 py-3 rounded-xl font-medium transition-all hover-target border border-white/5 mt-3">
                Pay Dues
              </button>
            </Link>
            <Link to="/student/rooms">
              <button className="w-full bg-white/5 text-white hover:bg-white/10 py-3 rounded-xl font-medium transition-all hover-target border border-white/5 mt-3">
                Book Room
              </button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentDashboard;
