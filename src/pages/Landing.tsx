import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Users, CreditCard, Star, MessageSquare, BarChart3, Heart } from 'lucide-react';
import StayzaLogo from '../components/ui/StayzaLogo';

/* ── Animated counter hook ── */
const useCounter = (end: number, duration = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return { count, ref };
};

/* ── Fade-in-up with IntersectionObserver ── */
const FadeInUp: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
};

/* ── Word-by-word stagger ── */
const StaggerWords: React.FC<{ text: string; className?: string; delay?: number }> = ({ text, className = '', delay = 0 }) => (
  <span className={className}>
    {text.split(' ').map((word, i) => (
      <motion.span key={i} className="inline-block mr-[0.3em]"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay + i * 0.08, ease: [0.22, 1, 0.36, 1] }}>
        {word}
      </motion.span>
    ))}
  </span>
);

const features = [
  { icon: Users, title: 'Smart Roommate Matching', desc: 'Our algorithm pairs you based on sleep habits, cleanliness, noise tolerance — and what past roommates actually said about each person.', color: 'bg-accent/10 text-accent' },
  { icon: ShieldCheck, title: 'Complaints That Get Resolved', desc: "File an issue, attach a photo, and we'll handle the rest. Unresolved complaints auto-escalate after 48 hours.", color: 'bg-sage/10 text-sage-dark' },
  { icon: CreditCard, title: 'Effortless Payments', desc: 'See what you owe, pay in one tap via card or UPI, and keep a clean history.', color: 'bg-amber/10 text-amber' },
  { icon: Star, title: 'Peer Feedback That Matters', desc: 'Rate your roommate when you leave. Those ratings shape future matches — good roommates rise to the top.', color: 'bg-accent/10 text-accent' },
  { icon: MessageSquare, title: 'AI Assistant', desc: "Ask about your room, complaints, or dues in plain English. It pulls your real data.", color: 'bg-sage/10 text-sage-dark' },
  { icon: BarChart3, title: 'Admin Command Center', desc: 'Room allocation grids, complaint queues, payment analytics, staff management — everything in one place.', color: 'bg-amber/10 text-amber' },
];

const Landing: React.FC = () => {
  const stat1 = useCounter(500, 1800);
  const stat2 = useCounter(98, 1600);
  const stat3 = useCounter(2, 1000);
  const stat4 = useCounter(48, 1400); // 4.8 displayed as 4.8

  return (
    <div className="relative w-full bg-background linen-texture overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative z-10 min-h-screen flex items-center px-8 pt-28 pb-20">
        {/* Ambient terracotta glow — off-center left */}
        <div className="absolute top-[10%] left-[-8%] w-[600px] h-[600px] rounded-full bg-[#C1694F]/[0.08] blur-[180px] pointer-events-none" />
        <div className="absolute bottom-[5%] right-[10%] w-[400px] h-[400px] rounded-full bg-sage/[0.05] blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          {/* Left column — text, asymmetric left-aligned */}
          <div className="lg:col-span-7 xl:col-span-7">
            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-50 border border-accent/20 mb-10 font-body">
              <span className="text-accent text-sm">✦</span>
              <span className="text-sm font-medium text-accent-dark">Built for students, not spreadsheets</span>
            </motion.div>

            {/* Headline — massive, editorial */}
            <h1 className="font-editorial leading-[0.95] tracking-tight mb-8">
              <span className="block text-[clamp(3rem,8vw,7.5rem)] text-warm-900">
                <StaggerWords text="Where students find" delay={0.2} />
              </span>
              {/* Italic colored line — larger, overlapping */}
              <motion.span
                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                animate={{ clipPath: 'inset(0 0% 0 0)' }}
                transition={{ duration: 0.7, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="block text-[clamp(3.5rem,9vw,8rem)] text-[#C1694F] italic -mt-2 lg:-mt-4 underline-hand">
                home away from home
              </motion.span>
            </h1>

            {/* Subtitle — ultra-light weight contrast */}
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="text-lg sm:text-xl text-warm-400 max-w-lg leading-relaxed mb-10 font-body font-light">
              AI-powered roommate matching, smart complaint resolution, seamless payments, and honest peer feedback — built for how students actually live.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="flex flex-wrap items-center gap-4 font-body">
              <Link to="/register">
                <button className="btn-pill btn-pill-primary text-base flex items-center gap-2">
                  Let's get started <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link to="/login">
                <button className="btn-pill btn-pill-ghost text-base flex items-center gap-2">
                  I already have an account
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Right column — stats stacked vertically + abstract collage */}
          <div className="lg:col-span-5 xl:col-span-5 relative">
            {/* Abstract warm illustration collage */}
            <motion.div initial={{ opacity: 0, scale: 0.9, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative -mt-12 lg:-mt-24 lg:-mr-16">
              {/* Overlapping abstract shapes */}
              <div className="relative w-full aspect-[4/5] max-w-md ml-auto">
                {/* Large warm rectangle */}
                <div className="absolute top-0 right-0 w-[85%] h-[70%] rounded-3xl bg-gradient-to-br from-[#C1694F]/20 to-amber/10 border border-accent/10" />
                {/* Overlapping sage card */}
                <div className="absolute bottom-[5%] left-0 w-[65%] h-[45%] rounded-3xl bg-gradient-to-br from-sage/15 to-sage/5 border border-sage/10 backdrop-blur-sm" />
                {/* Floating ink accent */}
                <div className="absolute top-[15%] left-[10%] w-32 h-32 rounded-full bg-ink/10 blur-sm" />
                {/* Small terracotta dot */}
                <div className="absolute bottom-[25%] right-[15%] w-16 h-16 rounded-full bg-accent/25" />
                {/* Text overlay on collage */}
                <div className="absolute top-[12%] right-[8%] text-right">
                  <div className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-warm-400 mb-1">Since 2024</div>
                  <div className="font-editorial text-4xl text-warm-900 italic">Smart</div>
                  <div className="font-editorial text-4xl text-accent italic -mt-1">Living</div>
                </div>
              </div>
            </motion.div>

            {/* Stats — stacked vertically */}
            <div className="mt-8 lg:mt-4 space-y-5 max-w-xs ml-auto font-body">
              {[
                { ref: stat1.ref, value: `${stat1.count}+`, label: 'Students housed' },
                { ref: stat2.ref, value: `${stat2.count}%`, label: 'Match accuracy' },
                { ref: stat3.ref, value: `<${stat3.count}h`, label: 'Avg resolution time' },
                { ref: stat4.ref, value: `${(stat4.count / 10).toFixed(1)}★`, label: 'Student rating' },
              ].map((s, i) => (
                <motion.div key={i} ref={s.ref}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.0 + i * 0.12 }}
                  className="flex items-baseline gap-4 border-b border-warm-200 pb-4">
                  <span className="font-editorial text-3xl text-warm-900 min-w-[80px]">{s.value}</span>
                  <span className="text-sm text-warm-400">{s.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Diagonal divider ── */}
      <div className="relative z-10 h-24 bg-warm-900 diagonal-top -mt-1" />

      {/* ── HOW IT WORKS — dark ink section ── */}
      <section className="relative z-10 bg-ink py-24 sm:py-32 px-8 linen-texture">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <FadeInUp>
            <span className="text-sm font-body font-semibold text-accent-light tracking-wide uppercase">How it works</span>
            <h2 className="font-editorial text-4xl sm:text-5xl text-cream mt-3 mb-16">Three steps to better living</h2>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: '01', title: 'Sign up & set preferences', desc: 'Tell us your sleep schedule, cleanliness level, and noise tolerance. Takes 30 seconds.' },
              { step: '02', title: 'Get matched & book', desc: "We'll find your ideal room and roommate. Browse options, pick one, and you're set." },
              { step: '03', title: 'Live & give feedback', desc: 'Pay rent, file complaints if needed, and rate your roommate when you leave. Simple.' },
            ].map((s, idx) => (
              <FadeInUp key={idx} delay={idx * 0.12}>
                <div className="text-center">
                  <div className="font-editorial text-6xl text-accent/60 mb-4">{s.step}</div>
                  <h3 className="font-editorial text-xl text-cream mb-3">{s.title}</h3>
                  <p className="text-sm text-warm-400 leading-relaxed font-body">{s.desc}</p>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative z-10 py-24 sm:py-32 px-8">
        <div className="max-w-5xl mx-auto">
          <FadeInUp className="text-center mb-16">
            <span className="text-sm font-body font-semibold text-accent tracking-wide uppercase">What makes Stayza different</span>
            <h2 className="font-editorial text-4xl sm:text-5xl text-warm-900 mt-3 mb-4">Built around how you actually live</h2>
            <p className="text-warm-500 max-w-xl mx-auto font-body">Not another generic management tool. Every feature exists because a real student needed it.</p>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <FadeInUp key={idx} delay={idx * 0.08}>
                  <div className="card p-7 h-full">
                    <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center mb-5`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-editorial text-xl text-warm-900 mb-3">{f.title}</h3>
                    <p className="text-sm text-warm-500 leading-relaxed font-body">{f.desc}</p>
                  </div>
                </FadeInUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 py-24 sm:py-32 px-8">
        <FadeInUp className="max-w-3xl mx-auto text-center">
          <div className="card p-12 sm:p-16 bg-accent-50 border-accent/20">
            <Heart className="w-10 h-10 text-accent mx-auto mb-6" />
            <h2 className="font-editorial text-3xl sm:text-4xl text-warm-900 mb-4">Ready to find your place?</h2>
            <p className="text-warm-500 max-w-md mx-auto mb-8 font-body">Join hundreds of students already living smarter with Stayza.</p>
            <Link to="/register">
              <button className="btn-pill btn-pill-primary text-base flex items-center gap-2 mx-auto font-body">
                Create your free account <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </FadeInUp>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-warm-200 py-8 px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <StayzaLogo size={28} showText={true} />
          <p className="text-xs text-warm-400 font-body">© 2026 Stayza. Built with care for student living.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
