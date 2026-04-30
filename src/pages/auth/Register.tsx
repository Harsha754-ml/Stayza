import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AtSign } from 'lucide-react';
import { authService } from '../../services/api';
import StayzaLogo from '../../components/ui/StayzaLogo';

const Register: React.FC = () => {
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '', password: '',
    sleep_schedule: 'flexible', cleanliness_level: 2, noise_tolerance: 2,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const update = (field: string, value: string | number) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await authService.register({ ...form, role: 'student' });
      navigate('/login');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: Record<string, unknown> } };
      const data = axiosErr.response?.data;
      if (data) {
        // Collect all error messages from the response
        const messages: string[] = [];
        for (const [key, val] of Object.entries(data)) {
          if (Array.isArray(val)) {
            messages.push(`${key}: ${val.join(', ')}`);
          } else if (typeof val === 'string') {
            messages.push(val);
          }
        }
        setError(messages.length > 0 ? messages.join(' | ') : 'Registration failed.');
      } else {
        setError('Registration failed. Is the backend running?');
      }
    } finally { setIsLoading(false); }
  };

  const inputCls = "w-full bg-bg border border-border rounded-lg py-2.5 px-4 text-text-1 text-sm placeholder-text-3 focus:outline-none focus:border-accent/50 transition-colors";
  const selectCls = "w-full bg-bg border border-border rounded-lg py-2.5 px-4 text-text-1 text-sm focus:outline-none focus:border-accent/50 transition-colors appearance-none";

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-12 relative">
      <div className="absolute inset-0 grid-bg opacity-[0.03]" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg z-10 card p-8">

        <div className="flex justify-center mb-6">
          <StayzaLogo size={38} showText={true} />
        </div>

        <h2 className="font-[family-name:var(--font-display)] text-3xl text-text-1 mb-1 text-center">Create your account</h2>
        <p className="text-sm text-text-3 mb-6 text-center">Join the next generation of hostel living.</p>

        {error && <div className="mb-4 text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-text-2 mb-1.5 block">First Name</label>
              <input type="text" value={form.first_name} onChange={e => update('first_name', e.target.value)}
                className={inputCls} placeholder="John" required />
            </div>
            <div>
              <label className="text-xs font-medium text-text-2 mb-1.5 block">Last Name</label>
              <input type="text" value={form.last_name} onChange={e => update('last_name', e.target.value)}
                className={inputCls} placeholder="Doe" required />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-text-2 mb-1.5 block">Username</label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3 w-4 h-4" />
              <input type="text" value={form.username} onChange={e => update('username', e.target.value)}
                className={`${inputCls} pl-10`} placeholder="johndoe" required />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-text-2 mb-1.5 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3 w-4 h-4" />
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                className={`${inputCls} pl-10`} placeholder="you@college.edu" required />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-text-2 mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3 w-4 h-4" />
              <input type="password" value={form.password} onChange={e => update('password', e.target.value)}
                className={`${inputCls} pl-10`} placeholder="Min 8 characters" required minLength={8} />
            </div>
          </div>

          <div className="pt-3 border-t border-border">
            <h3 className="text-sm font-semibold text-text-1 mb-3">Roommate preferences</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-text-2 mb-1.5 block">Sleep Schedule</label>
                <select value={form.sleep_schedule} onChange={e => update('sleep_schedule', e.target.value)} className={selectCls}>
                  <option value="early">Early Bird (10PM–6AM)</option>
                  <option value="night">Night Owl (2AM–10AM)</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-text-2 mb-1.5 block">Cleanliness</label>
                  <select value={form.cleanliness_level} onChange={e => update('cleanliness_level', Number(e.target.value))} className={selectCls}>
                    <option value={1}>Low</option><option value={2}>Medium</option><option value={3}>High</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-2 mb-1.5 block">Noise Tolerance</label>
                  <select value={form.noise_tolerance} onChange={e => update('noise_tolerance', Number(e.target.value))} className={selectCls}>
                    <option value={1}>Low</option><option value={2}>Medium</option><option value={3}>High</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-accent text-bg font-semibold text-sm py-3 rounded-lg hover:bg-accent-dim hover:scale-[1.01] transition-all disabled:opacity-50 mt-2">
            {isLoading ? 'Creating account...' : <>Let's go <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-text-2">
          Already have an account? <Link to="/login" className="text-accent hover:text-accent-dim font-medium transition-colors">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
