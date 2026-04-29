import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { authService } from '../../services/api';

interface StaffUser {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: string;
  phone: string;
}

const AdminStaff: React.FC = () => {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.staffList().then(res => {
      setStaff(res.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Staff Management</h1>
        <p className="text-gray-400">View hostel staff and admin users.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
          <div className="text-2xl font-bold text-green-400">{staff.filter(s => s.role === 'staff').length}</div>
          <div className="text-sm text-gray-400">Staff Members</div>
        </div>
        <div className="bg-primary-500/10 border border-primary-500/20 rounded-2xl p-4">
          <div className="text-2xl font-bold text-primary-400">{staff.filter(s => s.role === 'admin').length}</div>
          <div className="text-sm text-gray-400">Admins</div>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
          <div className="text-2xl font-bold text-white">{staff.length}</div>
          <div className="text-sm text-gray-400">Total</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((member, idx) => (
          <motion.div key={member.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-surface/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500/30 to-blue-500/30 border border-primary-500/20 flex items-center justify-center">
                <User className="w-6 h-6 text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold">{member.full_name}</div>
                <div className="text-sm text-gray-400">@{member.username}</div>
              </div>
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 capitalize ${
                member.role === 'admin' ? 'bg-primary-500/20 text-primary-400' : 'bg-green-500/20 text-green-400'
              }`}>
                {member.role}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Email</span>
                <span className="text-gray-300 truncate ml-2">{member.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Phone</span>
                <span className="text-gray-300">{member.phone || '—'}</span>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 mt-3 border-t border-white/5">
              <button className="text-primary-400 hover:text-primary-300 text-xs font-medium transition-colors hover-target">
                View Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {staff.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <User className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No staff members found.</p>
        </div>
      )}
    </motion.div>
  );
};

export default AdminStaff;
