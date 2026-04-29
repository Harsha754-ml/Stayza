import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../services/api';
import { ArrowRight, Lock, GraduationCap, ShieldCheck, Eye, EyeOff, User } from 'lucide-react';
import StayzaLogo from '../../components/ui/StayzaLogo';

type Role = 'student' | 'admin';

const Login: React.FC = () => {
  const [role, setRole] = useState<Role>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleRoleSwitch = (r: Role) => { setRole(r); setUsername(''); setPassword(''); setError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await authService.login({ username, password });
      const { access, refresh, user } = res.data;
      if (role === 'student' && user.role !== 'student') { setError('Not a student account.'); setIsLoading(false); return; }
      if (role === 'admin' && user.role !== 'admin' && user.role !== 'staff') { setError('Not an admin/staff account.'); setIsLoading(false); return; }
      login(user, access, refresh);
      navigate(user.role === 'student' ? '/student/dashboard' : '/admin/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || 'Invalid credentials.');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-12 relative">
      {/* Grid bg */}
      <div className="absolute inset-0 grid-bg opacity-[0.03]" />
      <div className="absolute top-[20%] left-[30%] w-[400px] h-[400px] rounded-full bg-accent/[0.03] blur-[180px] pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10 space-y-6">

        <div className="flex justify-center mb-2">
          <StayzaLogo size={38} showText={true} />
        </div>

        {/* Role toggle */}
        <div className="flex bg-surface border border-border rounded-lg p-1 gap-1">
          {(['student', 'admin'] as Role[]).map(r => {
            const isActive = role === r;
            const Icon = r === 'student' ? GraduationCap : ShieldCheck;
            return (
              <button key={r} onClick={() => handleRoleSwitch(r)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                  isActive ? 'bg-accent-bg text-accent border border-accent/30' : 'text-text-2 hover:text-text-1'
                }`}>
                <Icon className="w-4 h-4" />
                {r === 'student' ? 'Student' : 'Admin'}
              </button>
            );
          })}
        </div>

        {/* Form card */}
        <AnimatePresence mode="wait">
          <motion.div key={role}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="card p-7">
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-text-1 mb-1">
              {role === 'student' ? 'Student Portal' : 'Admin Portal'}
            </h2>
            <p className="text-sm text-text-3 mb-6">
              {role === 'student' ? 'Sign in with your student credentials' : 'Restricted to hostel management staff'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-text-2 mb-1.5 block">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3 w-4 h-4" />
                  <input type="text" value={username}
                    onChange={e => { setUsername(e.target.value); setError(''); }}
                    className="w-full bg-bg border border-border rounded-lg py-2.5 pl-10 pr-4 text-text-1 text-sm placeholder-text-3 focus:outline-none focus:border-accent/50 transition-colors"
                    placeholder={role === 'student' ? 'john' : 'admin'} required />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-text-2 mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3 w-4 h-4" />
                  <input type={showPassword ? 'text' : 'password'} value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    className="w-full bg-bg border border-border rounded-lg py-2.5 pl-10 pr-10 text-text-1 text-sm placeholder-text-3 focus:outline-none focus:border-accent/50 transition-colors"
                    placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-2 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
                  {error}
                </motion.p>
              )}

              <button type="submit" disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-accent text-bg font-semibold text-sm py-3 rounded-lg hover:bg-accent-dim hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <>Sign in as {role === 'student' ? 'Student' : 'Admin'} <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-border text-center">
              {role === 'student' ? (
                <p className="text-sm text-text-2">
                  New here?{' '}
                  <Link to="/register" className="text-accent hover:text-accent-dim font-medium transition-colors">Create an account</Link>
                </p>
              ) : (
                <p className="text-xs text-text-3">Admin accounts are provisioned by hostel management.</p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <p className="text-center text-xs text-text-3">
          {role === 'student' ? 'Hostel admin? ' : 'Student? '}
          <button onClick={() => handleRoleSwitch(role === 'student' ? 'admin' : 'student')}
            className="text-text-2 hover:text-text-1 underline underline-offset-2 transition-colors">
            Switch to {role === 'student' ? 'Admin' : 'Student'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
