import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, CheckCircle2, Clock, User, Send } from 'lucide-react';
import { feedbackService } from '../../services/api';

interface PendingFeedback {
  booking_id: number;
  room_number: string;
  roommate: { id: number; username: string; full_name: string };
  checked_out_at: string;
}

interface GivenFeedback {
  id: number;
  reviewee_detail: { id: number; full_name: string };
  cleanliness_rating: number;
  noise_rating: number;
  overall_rating: number;
  comment: string;
  average_rating: number;
  created_at: string;
}

interface ReceivedFeedback {
  id: number;
  reviewer_detail: { id: number; full_name: string };
  cleanliness_rating: number;
  noise_rating: number;
  overall_rating: number;
  comment: string;
  average_rating: number;
  created_at: string;
}

const StarRating: React.FC<{ value: number; onChange: (v: number) => void; label: string }> = ({ value, onChange, label }) => (
  <div>
    <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} type="button" onClick={() => onChange(star)}
          className="transition-all hover:scale-110 hover-target">
          <Star className={`w-7 h-7 ${star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
        </button>
      ))}
    </div>
  </div>
);

const ReadOnlyStars: React.FC<{ value: number }> = ({ value }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(star => (
      <Star key={star} className={`w-4 h-4 ${star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
    ))}
  </div>
);

const Feedback: React.FC = () => {
  const [tab, setTab] = useState<'pending' | 'given' | 'received'>('pending');
  const [pending, setPending] = useState<PendingFeedback[]>([]);
  const [given, setGiven] = useState<GivenFeedback[]>([]);
  const [received, setReceived] = useState<ReceivedFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state for the feedback being submitted
  const [activeReview, setActiveReview] = useState<PendingFeedback | null>(null);
  const [cleanRating, setCleanRating] = useState(3);
  const [noiseRating, setNoiseRating] = useState(3);
  const [overallRating, setOverallRating] = useState(3);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, gRes, rRes] = await Promise.all([
        feedbackService.pending(),
        feedbackService.given(),
        feedbackService.received(),
      ]);
      setPending(pRes.data);
      setGiven(gRes.data.results || gRes.data);
      setReceived(rRes.data.results || rRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReview) return;
    setSubmitting(true);
    try {
      await feedbackService.submit({
        reviewee: activeReview.roommate.id,
        booking: activeReview.booking_id,
        cleanliness_rating: cleanRating,
        noise_rating: noiseRating,
        overall_rating: overallRating,
        comment,
      });
      setSubmitSuccess(true);
      setActiveReview(null);
      setCleanRating(3); setNoiseRating(3); setOverallRating(3); setComment('');
      fetchAll();
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Roommate Feedback</h1>
        <p className="text-gray-400">Rate your roommates when you check out. Your ratings help future students find better matches.</p>
      </div>

      {submitSuccess && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="text-green-300 font-medium">Feedback submitted! Your review helps the community.</span>
        </motion.div>
      )}

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-primary-500/10 border border-primary-500/20 rounded-2xl">
        <Star className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-primary-300 font-medium">How Feedback Works</p>
          <p className="text-xs text-primary-400/70 mt-1">
            After you check out, you can rate each roommate on cleanliness, noise, and overall experience (1–5 stars).
            These ratings are factored into the roommate matching algorithm — 30% of the match score comes from peer reviews.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {([
          { key: 'pending' as const, label: 'Pending Reviews', count: pending.length },
          { key: 'given' as const, label: 'Given', count: given.length },
          { key: 'received' as const, label: 'Received', count: received.length },
        ]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all hover-target ${
              tab === t.key ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'
            }`}>
            {t.label}
            <span className="ml-2 text-xs opacity-60">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Pending Reviews Tab */}
      {tab === 'pending' && (
        <div className="space-y-4">
          {pending.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No pending reviews. You're all caught up!</p>
            </div>
          ) : (
            pending.map((item, idx) => (
              <motion.div key={`${item.booking_id}-${item.roommate.id}`}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-surface/50 border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/30 to-red-500/30 border border-orange-500/20 flex items-center justify-center">
                      <User className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{item.roommate.full_name}</h3>
                      <p className="text-sm text-gray-400">Room {item.room_number} · Checked out {new Date(item.checked_out_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button onClick={() => { setActiveReview(item); setCleanRating(3); setNoiseRating(3); setOverallRating(3); setComment(''); }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 border border-primary-500/30 rounded-xl text-sm font-medium transition-all hover-target">
                    <Star className="w-4 h-4" /> Rate Roommate
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Given Reviews Tab */}
      {tab === 'given' && (
        <div className="space-y-4">
          {given.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>You haven't given any feedback yet.</p>
            </div>
          ) : (
            given.map((fb, idx) => (
              <motion.div key={fb.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-surface/50 border border-white/5 p-6 rounded-2xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold">You reviewed {fb.reviewee_detail.full_name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{new Date(fb.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-400">{fb.average_rating}★</div>
                    <div className="text-xs text-gray-500">avg</div>
                  </div>
                </div>
                <div className="flex gap-6 mb-3">
                  <div><span className="text-xs text-gray-500">Cleanliness</span><div className="mt-1"><ReadOnlyStars value={fb.cleanliness_rating} /></div></div>
                  <div><span className="text-xs text-gray-500">Noise</span><div className="mt-1"><ReadOnlyStars value={fb.noise_rating} /></div></div>
                  <div><span className="text-xs text-gray-500">Overall</span><div className="mt-1"><ReadOnlyStars value={fb.overall_rating} /></div></div>
                </div>
                {fb.comment && <p className="text-sm text-gray-400 italic border-t border-white/5 pt-3">"{fb.comment}"</p>}
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Received Reviews Tab */}
      {tab === 'received' && (
        <div className="space-y-4">
          {received.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No feedback received yet. Ratings appear after roommates check out.</p>
            </div>
          ) : (
            received.map((fb, idx) => (
              <motion.div key={fb.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-surface/50 border border-white/5 p-6 rounded-2xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold">{fb.reviewer_detail.full_name} reviewed you</h3>
                    <p className="text-xs text-gray-500 mt-1">{new Date(fb.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-400">{fb.average_rating}★</div>
                    <div className="text-xs text-gray-500">avg</div>
                  </div>
                </div>
                <div className="flex gap-6 mb-3">
                  <div><span className="text-xs text-gray-500">Cleanliness</span><div className="mt-1"><ReadOnlyStars value={fb.cleanliness_rating} /></div></div>
                  <div><span className="text-xs text-gray-500">Noise</span><div className="mt-1"><ReadOnlyStars value={fb.noise_rating} /></div></div>
                  <div><span className="text-xs text-gray-500">Overall</span><div className="mt-1"><ReadOnlyStars value={fb.overall_rating} /></div></div>
                </div>
                {fb.comment && <p className="text-sm text-gray-400 italic border-t border-white/5 pt-3">"{fb.comment}"</p>}
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Submit Feedback Modal */}
      <AnimatePresence>
        {activeReview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setActiveReview(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-1">Rate {activeReview.roommate.full_name}</h2>
              <p className="text-sm text-gray-400 mb-6">Room {activeReview.room_number}</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <StarRating value={cleanRating} onChange={setCleanRating} label="Cleanliness" />
                <StarRating value={noiseRating} onChange={setNoiseRating} label="Noise Respect" />
                <StarRating value={overallRating} onChange={setOverallRating} label="Overall Experience" />

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Comment (optional)</label>
                  <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3}
                    placeholder="Share your experience..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setActiveReview(null)}
                    className="flex-1 py-3 bg-white/5 text-gray-400 hover:bg-white/10 rounded-xl font-medium transition-all hover-target border border-white/5">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-400 text-black font-bold rounded-xl transition-all hover-target disabled:opacity-50">
                    {submitting ? 'Submitting...' : <><Send className="w-4 h-4" /> Submit</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Feedback;
