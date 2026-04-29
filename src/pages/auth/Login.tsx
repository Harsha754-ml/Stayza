import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../services/api';
import { ArrowRight, Mail, Lock, GraduationCap, ShieldCheck, Eye, EyeOff } from 'lucide-react';

type Role = 'student' | 'admin';

const roleConfig = {
  student: {
    icon: GraduationCap,
    label: 'Student',
    accent: 'from-primary-500 to-cyan-400',
    ring: 'focus:ring-primary-500',
    glow: 'bg-primary-600/20',
    glowAlt: 'bg-primary-400/10',
    btn: 'bg-primary-500 hover:bg-primary-400',
    tab: 'bg-primary-500/20 text-primary-400 border-primary-500/40',
    hint: 'Use your student credentials to sign in',
    placeholder: 'john',
  },
  admin: {
    icon: ShieldCheck,
    label: 'Admin',
    accent: 'from-violet-500 to-indigo-500',
    ring: 'focus:ring-violet-500',
    glow: 'bg-violet-600/20',
    glowAlt: 'bg-indigo-400/10',
    btn: 'bg-violet-500 hover:bg-violet-400',
    tab: 'bg-violet-500/20 text-violet-400 border-violet-500/40',
    hint: 'Restricted to hostel management staff only',
    placeholder: 'admin',
  },
};

const Login: React.FC = () => {
  const [role, setRole] = useState<Role>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const cfg = roleConfig[role];
  const RoleIcon = cfg.icon;

  const handleRoleSwitch = (newRole: Role) => {
    setRole(newRole);
    setUsername('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await authService.login({ username, password });
      const { access, refresh, user } = res.data;

      if (role === 'student' && user.role !== 'student') {
        setError('This account is not a student account.');
        setIsLoading(false);
        return;
      }
      if (role === 'admin' && user.role !== 'admin' && user.role !== 'staff') {
        setError('This account is not an admin/staff account.');
        setIsLoading(false);
        return;
      }

      login(user, access, refresh);
      navigate(user.role === 'student' ? '/student/dashboard' : '/admin/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center bg-background px-4 py-12"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={role}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 overflow-hidden pointer-events-none"
        >
          <div className={`absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full ${cfg.glow} blur-[130px]`} />
          <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full ${cfg.glowAlt} blur-[130px]`} />
        </motion.div>
      </AnimatePresence>

      <div className="w-full max-w-md z-10 space-y-6">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center">
          <div className="text-3xl font-black tracking-tighter text-white mb-1">STAYZA</div>
          <p className="text-gray-500 text-sm">PG & Hostel Management System</p>
        </motion.div>

        {/* Role Toggle */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="flex bg-surface/60 border border-white/10 rounded-2xl p-1.5 gap-1.5">
          {(['student', 'admin'] as Role[]).map(r => {
            const rc = roleConfig[r];
            const Icon = rc.icon;
            const isActive = role === r;
            return (
              <button key={r} onClick={() => handleRoleSwitch(r)}
                className={`relative flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 hover-target ${
                  isActive ? `${rc.tab} border` : 'text-gray-500 hover:text-gray-300'
                }`}>
                <Icon className="w-4 h-4" />
                {rc.label} Login
                {isActive && (
                  <motion.div layoutId="roleIndicator" className="absolute inset-0 rounded-xl border border-current opacity-20" />
                )}
              </button>
            );
          })}
        </motion.div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div key={role}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-surface/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cfg.accent} flex items-center justify-center shadow-lg`}>
                <RoleIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white leading-tight">
                  {role === 'student' ? 'Student Portal' : 'Admin Portal'}
                </h2>
                <p className="text-gray-400 text-sm mt-0.5">{cfg.hint}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Username</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4.5 h-4.5" />
                  <input type="text" value={username}
                    onChange={e => { setUsername(e.target.value); setError(''); }}
                    className={`w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 ${cfg.ring} transition-all`}
                    placeholder={cfg.placeholder} required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4.5 h-4.5" />
                  <input type={showPassword ? 'text' : 'password'} value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    className={`w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-11 text-white placeholder-gray-600 focus:outline-none focus:ring-2 ${cfg.ring} transition-all`}
                    placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors hover-target">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                  {error}
                </motion.p>
              )}

              <button type="submit" disabled={isLoading}
                className={`w-full group ${cfg.btn} text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover-target mt-2`}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  <>
                    Sign In as {cfg.label}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/5">
              {role === 'student' ? (
                <p className="text-center text-gray-400 text-sm">
                  New student?{' '}
                  <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors hover-target">
                    Create an account
                  </Link>
                </p>
              ) : (
                <p className="text-center text-gray-500 text-xs leading-relaxed">
                  Admin accounts are provisioned by hostel management.<br />
                  Contact your system administrator for access.
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-center text-xs text-gray-600">
          {role === 'student' ? 'Are you a hostel admin? ' : 'Looking for student login? '}
          <button onClick={() => handleRoleSwitch(role === 'student' ? 'admin' : 'student')}
            className="text-gray-400 hover:text-white underline underline-offset-2 transition-colors hover-target">
            Switch to {role === 'student' ? 'Admin' : 'Student'} Login
          </button>
        </motion.p>
      </div>
    </motion.div>
  );
};

export default Login;
