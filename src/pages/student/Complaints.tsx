import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Upload, X, Clock, CheckCircle2, Flame, PlusCircle } from 'lucide-react';
import { complaintService } from '../../services/api';

interface Complaint {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  image_url: string | null;
  escalated: boolean;
  assigned_to_detail: { full_name: string } | null;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'text-blue-400', bg: 'bg-blue-500/20', icon: Clock },
  in_progress: { label: 'In Progress', color: 'text-orange-400', bg: 'bg-orange-500/20', icon: AlertCircle },
  resolved: { label: 'Resolved', color: 'text-green-400', bg: 'bg-green-500/20', icon: CheckCircle2 },
};

const categories = ['maintenance', 'cleanliness', 'security', 'noise', 'utilities', 'other'];

const Complaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('maintenance');
  const [priority, setPriority] = useState('low');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComplaints = async () => {
    try {
      const res = await complaintService.mine();
      setComplaints(res.data.results || res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('priority', priority);
      if (imageFile) formData.append('image', imageFile);
      await complaintService.create(formData);
      setTitle(''); setDescription(''); setCategory('maintenance'); setPriority('low');
      setImageFile(null); setImagePreview(null); setShowForm(false);
      fetchComplaints();
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);

  const getTimeAgo = (dateStr: string) => {
    const hours = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60);
    if (hours < 1) return `${Math.round(hours * 60)}m ago`;
    if (hours < 24) return `${Math.round(hours)}h ago`;
    return `${Math.round(hours / 24)}d ago`;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">My Complaints</h1>
          <p className="text-gray-400">Track your filed complaints. Unresolved issues auto-escalate after 48 hours.</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-400 text-black font-bold px-5 py-2.5 rounded-xl transition-all hover-target">
          <PlusCircle className="w-5 h-5" /> New Complaint
        </button>
      </div>

      <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
        <Flame className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-red-300 font-medium">Auto-Escalation Active</p>
          <p className="text-xs text-red-400/70 mt-1">Complaints unresolved for more than 48 hours are automatically escalated.</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'in_progress', 'resolved'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all hover-target capitalize ${
              filter === f ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'
            }`}>
            {f === 'all' ? 'All' : f.replace('_', ' ')}
            <span className="ml-2 text-xs opacity-60">
              {f === 'all' ? complaints.length : complaints.filter(c => c.status === f).length}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {filtered.map((complaint, idx) => {
            const cfg = statusConfig[complaint.status] || statusConfig.pending;
            const StatusIcon = cfg.icon;
            return (
              <motion.div key={complaint.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ delay: idx * 0.05 }}
                className="bg-surface/50 border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <span className="font-mono text-xs text-gray-500">#{complaint.id}</span>
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />{cfg.label}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-400 capitalize">{complaint.category}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        complaint.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        complaint.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>{complaint.priority}</span>
                      {complaint.escalated && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">
                          <Flame className="w-3 h-3" /> Escalated
                        </span>
                      )}
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-1">{complaint.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{complaint.description}</p>
                    {complaint.assigned_to_detail && (
                      <p className="text-xs text-primary-400 mt-2">Assigned to: {complaint.assigned_to_detail.full_name}</p>
                    )}
                  </div>
                  {complaint.image_url && (
                    <img src={complaint.image_url} alt="proof" className="shrink-0 w-16 h-16 rounded-xl object-cover border border-white/10" />
                  )}
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5 text-xs text-gray-500">
                  <span>Filed {getTimeAgo(complaint.created_at)}</span>
                  <span>•</span>
                  <span>Updated {getTimeAgo(complaint.updated_at)}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No complaints in this category.</p>
          </div>
        )}
      </div>

      {/* New Complaint Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">File a Complaint</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white transition-colors hover-target">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
                    placeholder="Brief description of the issue"
                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 capitalize appearance-none">
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Priority</label>
                    <select value={priority} onChange={e => setPriority(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 capitalize appearance-none">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={4}
                    placeholder="Describe the problem in detail..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Attach Proof (Optional)</label>
                  {imagePreview ? (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden border border-white/10">
                      <img src={imagePreview} alt="proof" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-red-500/80 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-primary-500/50 hover:bg-white/5 transition-all">
                      <Upload className="w-8 h-8 text-gray-500 mb-2" />
                      <span className="text-sm text-gray-500">Click to upload photo</span>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  )}
                </div>
                <button type="submit" disabled={isSubmitting}
                  className="w-full bg-primary-500 hover:bg-primary-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-all hover-target">
                  {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Complaints;
