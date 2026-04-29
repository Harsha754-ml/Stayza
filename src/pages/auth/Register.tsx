import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, AtSign } from 'lucide-react';
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

  const update = (field: string, value: string | number) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await authService.register({ ...form, role: 'student' });
      navigate('/login');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: Record<string, string[]> } };
      const data = axiosErr.response?.data;
      if (data) {
        const firstErr = Object.values(data).flat()[0];
        setError(typeof firstErr === 'string' ? firstErr : 'Registration failed.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-400/10 blur-[120px]" />
      </div>

      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
        className="w-full max-w-lg bg-surface/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl z-10">
        <div className="flex justify-center mb-6">
          <StayzaLogo size={40} showText={true} />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
        <p className="text-gray-400 mb-8">Join the next generation of hostel living.</p>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input type="text" value={form.first_name} onChange={e => update('first_name', e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  placeholder="John" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Last Name</label>
              <input type="text" value={form.last_name} onChange={e => update('last_name', e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                placeholder="Doe" required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Username</label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input type="text" value={form.username} onChange={e => update('username', e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                placeholder="johndoe" required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                placeholder="you@college.edu" required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input type="password" value={form.password} onChange={e => update('password', e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                placeholder="Min 8 characters" required minLength={8} />
            </div>
          </div>

          {/* Roommate Preferences */}
          <div className="pt-4 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Roommate Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Sleep Schedule</label>
                <select value={form.sleep_schedule} onChange={e => update('sleep_schedule', e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none">
                  <option value="early">Early Bird (10PM–6AM)</option>
                  <option value="night">Night Owl (2AM–10AM)</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Cleanliness Level</label>
                  <select value={form.cleanliness_level} onChange={e => update('cleanliness_level', Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none">
                    <option value={1}>Low</option>
                    <option value={2}>Medium</option>
                    <option value={3}>High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Noise Tolerance</label>
                  <select value={form.noise_tolerance} onChange={e => update('noise_tolerance', Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none">
                    <option value={1}>Low</option>
                    <option value={2}>Medium</option>
                    <option value={3}>High</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full group bg-white hover:bg-gray-200 text-background font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center hover-target disabled:opacity-50">
            {isLoading ? 'Creating Account...' : 'Register'}
            {!isLoading && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Already have an account? <Link to="/login" className="text-white hover:text-gray-200 hover-target">Log In</Link>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Register;
