import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Star, Moon, Sparkles, Save, Check } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { authService, feedbackService } from '../../services/api';

const Profile: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({
    sleep_schedule: user?.sleep_schedule || 'flexible',
    cleanliness_level: user?.cleanliness_level || 2,
    noise_tolerance: user?.noise_tolerance || 2,
  });
  const [reputation, setReputation] = useState<{ score: number | null; count: number }>({ score: null, count: 0 });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.id) {
      feedbackService.reputation(user.id).then(res => {
        setReputation({ score: res.data.avg_overall, count: res.data.feedback_count });
      }).catch(() => {});
    }
  }, [user?.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authService.updateProfile(form);
      setUser(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const selectCls = "w-full bg-input border border-border rounded-lg py-2.5 px-3 text-text-1 text-[13px] focus:outline-none focus:border-accent/50 transition-colors appearance-none";

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <div className="text-[11px] font-medium tracking-[0.08em] uppercase text-text-2 mb-2">Profile</div>
        <h1 className="text-[28px] text-text-1 leading-tight">
          <span className="font-semibold">Your </span>
          <span className="font-[family-name:var(--font-display)] italic">profile</span>
        </h1>
      </div>

      {/* User info card */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-accent-glow flex items-center justify-center text-accent text-xl font-semibold">
            {user?.full_name?.charAt(0) || '?'}
          </div>
          <div>
            <div className="text-[18px] font-semibold text-text-1">{user?.full_name}</div>
            <div className="text-[13px] text-text-2">@{user?.username} · {user?.email}</div>
          </div>
        </div>

        {/* Reputation */}
        <div className="flex items-center gap-6 p-4 rounded-lg bg-overlay mb-6">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow" strokeWidth={1.5} />
            <span className="text-[28px] font-semibold tabular-nums text-text-1">
              {reputation.score ? reputation.score.toFixed(1) : '—'}
            </span>
          </div>
          <div>
            <div className="text-[13px] font-medium text-text-1">Reputation Score</div>
            <div className="text-[12px] text-text-2">{reputation.count} review{reputation.count !== 1 ? 's' : ''} from past roommates</div>
          </div>
        </div>

        {/* Preferences form */}
        <h3 className="text-[14px] font-semibold text-text-1 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" strokeWidth={1.5} />
          Roommate Preferences
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-medium text-text-2 uppercase tracking-wide mb-1.5 block">Sleep Schedule</label>
            <select value={form.sleep_schedule} onChange={e => setForm({ ...form, sleep_schedule: e.target.value })} className={selectCls}>
              <option value="early">Early Bird (10PM–6AM)</option>
              <option value="night">Night Owl (2AM–10AM)</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-medium text-text-2 uppercase tracking-wide mb-1.5 block">Cleanliness</label>
              <select value={form.cleanliness_level} onChange={e => setForm({ ...form, cleanliness_level: Number(e.target.value) })} className={selectCls}>
                <option value={1}>Low</option><option value={2}>Medium</option><option value={3}>High</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-text-2 uppercase tracking-wide mb-1.5 block">Noise Tolerance</label>
              <select value={form.noise_tolerance} onChange={e => setForm({ ...form, noise_tolerance: Number(e.target.value) })} className={selectCls}>
                <option value={1}>Low</option><option value={2}>Medium</option><option value={3}>High</option>
              </select>
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="mt-6 flex items-center gap-2 bg-accent text-white font-semibold text-[13px] px-5 py-2.5 rounded-lg hover:bg-accent-dim transition-all disabled:opacity-50">
          {saved ? <><Check className="w-4 h-4" /> Saved!</> : saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save preferences</>}
        </button>
      </div>
    </div>
  );
};

export default Profile;
