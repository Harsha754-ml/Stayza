import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Moon, Heart, Star, CheckCircle2, RefreshCw } from 'lucide-react';
import { authService } from '../../services/api';

interface MatchResult {
  user: {
    id: number;
    username: string;
    full_name: string;
    role: string;
    reputation: { score: number | null; count: number };
  };
  score: number;
  breakdown: {
    sleep_match: number;
    cleanliness_match: number;
    noise_match: number;
    reputation: number;
  };
  feedback_count: number;
}

const avatarColors = [
  'from-primary-500 to-blue-500',
  'from-purple-500 to-pink-500',
  'from-orange-500 to-red-500',
  'from-green-500 to-teal-500',
];

const RoommateMatching: React.FC = () => {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [requested, setRequested] = useState<number | null>(null);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await authService.roommateMatches();
      setMatches(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMatches(); }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Roommate Matching</h1>
        <p className="text-gray-400">AI-scored matches based on preferences and peer feedback from past roommates.</p>
      </div>

      <div className="bg-primary-500/10 border border-primary-500/20 rounded-2xl p-4 flex items-center gap-3">
        <Star className="w-5 h-5 text-primary-400" />
        <div>
          <span className="text-sm font-bold text-primary-300">Scoring Formula</span>
          <p className="text-xs text-primary-400/70 mt-0.5">score = (sleep + cleanliness + noise) × 70% + peer_reputation × 30%</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">{matches.length} Matches Found</h2>
        <button onClick={fetchMatches} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors hover-target">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <AnimatePresence>
        {matches.map((match, idx) => (
          <motion.div key={match.user.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08 }}
            className={`bg-surface/50 border rounded-2xl p-6 transition-all ${
              requested === match.user.id ? 'border-primary-500/50 bg-primary-500/5' : 'border-white/5 hover:border-white/10'
            }`}>
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                {match.user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="text-white font-bold text-lg">{match.user.full_name}</h3>
                    <p className="text-sm text-gray-400">@{match.user.username}</p>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <div className="relative w-16 h-16">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                        <circle cx="18" cy="18" r="14" fill="none"
                          stroke={match.score >= 90 ? '#14b8a6' : match.score >= 75 ? '#3b82f6' : '#f59e0b'}
                          strokeWidth="3" strokeLinecap="round"
                          strokeDasharray={`${(match.score / 100) * 88} 88`} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{match.score}%</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">Match</span>
                  </div>
                </div>

                <div className="flex gap-4 mt-3 flex-wrap">
                  {[
                    { label: 'Sleep', value: match.breakdown.sleep_match },
                    { label: 'Clean', value: match.breakdown.cleanliness_match },
                    { label: 'Noise', value: match.breakdown.noise_match },
                    { label: 'Reputation', value: match.breakdown.reputation },
                  ].map(b => (
                    <div key={b.label} className="flex items-center gap-2">
                      <Moon className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-xs text-gray-400">{b.label}: <span className="text-white font-medium">{b.value}%</span></span>
                    </div>
                  ))}
                  {match.feedback_count > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-yellow-400 font-medium">
                        {match.user.reputation?.score ?? '—'}★ ({match.feedback_count} review{match.feedback_count !== 1 ? 's' : ''})
                      </span>
                    </div>
                  )}
                  {match.feedback_count === 0 && (
                    <span className="text-xs text-gray-500 italic">No reviews yet</span>
                  )}
                </div>

                <div className="flex items-center justify-end mt-4 pt-4 border-t border-white/5">
                  {requested === match.user.id ? (
                    <span className="flex items-center gap-2 text-sm text-green-400 font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Request Sent
                    </span>
                  ) : (
                    <button onClick={() => setRequested(match.user.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 border border-primary-500/30 rounded-xl text-sm font-medium transition-all hover-target">
                      <Heart className="w-4 h-4" /> Request Roommate
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {matches.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No matches found. Update your preferences to see matches.</p>
        </div>
      )}
    </motion.div>
  );
};

export default RoommateMatching;
