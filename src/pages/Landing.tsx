import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Users, CreditCard, Star, MessageSquare, BarChart3, Heart } from 'lucide-react';
import StayzaLogo from '../components/ui/StayzaLogo';

/* ── Counter hook ── */
const useCounter = (end: number, duration = 1800) => {
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

/* ── Fade-in-up ── */
const FadeIn: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>{children}</motion.div>
  );
};

/* ── Word stagger ── */
const Words: React.FC<{ text: string; className?: string; delay?: number }> = ({ text, className = '', delay = 0 }) => (
  <span className={className}>
    {text.split(' ').map((word, i) => (
      <motion.span key={i} className="inline-block mr-[0.28em]"
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: delay + i * 0.06, ease: [0.22, 1, 0.36, 1] }}>
        {word}
      </motion.span>
    ))}
  </span>
);

const features = [
  { icon: Users, title: 'Smart Roommate Matching', desc: 'Pairs you based on sleep habits, cleanliness, noise tolerance — and what past roommates actually said.' },
  { icon: ShieldCheck, title: 'Complaints That Resolve', desc: 'File an issue, attach a photo. Unresolved complaints auto-escalate after 48 hours.' },
  { icon: CreditCard, title: 'Effortless Payments', desc: 'See what you owe, pay in one tap via card or UPI, keep a clean history.' },
  { icon: Star, title: 'Peer Feedback', desc: 'Rate your roommate when you leave. Those ratings shape future matches.' },
  { icon: MessageSquare, title: 'AI Assistant', desc: 'Ask about your room, complaints, or dues in plain English. Real data, not fluff.' },
  { icon: BarChart3, title: 'Admin Dashboard', desc: 'Room grids, complaint queues, payment analytics, staff management — one place.' },
];

const Landing: React.FC = () => {
  const s1 = useCounter(500, 1800);
  const s2 = useCounter(98, 1600);
  const s3 = useCounter(2, 1000);
  const s4 = useCounter(48, 1400);

  return (
    <div className="relative w-full bg-bg overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center px-6 sm:px-8 pt-24 pb-20">
        {/* Grid pattern */}
        <div className="absolute inset-0 grid-bg opacity-[0.04]" />
        {/* Faint accent glow */}
        <div className="absolute top-[20%] left-[5%] w-[500px] h-[500px] rounded-full bg-accent/[0.03] blur-[200px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Left — text */}
            <div className="lg:col-span-7">
              {/* Badge */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="inline-flex items-center px-3 py-1.5 rounded bg-accent-bg border border-accent/30 mb-10">
                <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-accent">
                  ✦ Built for students, not spreadsheets
                </span>
              </motion.div>

              {/* Headline */}
              <h1 className="font-[family-name:var(--font-display)] leading-[0.95] tracking-tight mb-8">
                <span className="block text-[clamp(2.8rem,7vw,6rem)] text-text-1">
                  <Words text="Where students find" delay={0.2} />
                </span>
                <motion.span
                  initial={{ clipPath: 'inset(0 100% 0 0)' }}
                  animate={{ clipPath: 'inset(0 0% 0 0)' }}
                  transition={{ duration: 0.5, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  className="block text-[clamp(3rem,8vw,6.5rem)] text-accent italic -mt-1">
                  home away from home
                </motion.span>
              </h1>

              {/* Subtitle */}
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="text-lg text-text-2 max-w-lg leading-relaxed mb-10 font-light">
                AI-powered roommate matching, smart complaint resolution, seamless payments, and honest peer feedback — built for how students actually live.
              </motion.p>

              {/* CTAs */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.05 }}
                className="flex flex-wrap items-center gap-3">
                <Link to="/register">
                  <button className="inline-flex items-center gap-2 bg-accent text-bg font-semibold text-[15px] px-7 py-3.5 rounded-lg hover:bg-accent-dim hover:scale-[1.02] transition-all">
                    Let's get started <ArrowRight className="w-4.5 h-4.5" />
                  </button>
                </Link>
                <Link to="/login">
                  <button className="inline-flex items-center gap-2 bg-transparent border border-border text-text-1 font-medium text-[15px] px-7 py-3.5 rounded-lg hover:border-text-2 transition-all">
                    I already have an account
                  </button>
                </Link>
              </motion.div>
            </div>

            {/* Right — stats stacked */}
            <div className="lg:col-span-5">
              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="space-y-0 border border-border rounded-xl overflow-hidden bg-surface">
                {[
                  { ref: s1.ref, value: `${s1.count}+`, label: 'Students housed' },
                  { ref: s2.ref, value: `${s2.count}%`, label: 'Match accuracy' },
                  { ref: s3.ref, value: `<${s3.count}h`, label: 'Avg resolution time' },
                  { ref: s4.ref, value: `${(s4.count / 10).toFixed(1)}★`, label: 'Student rating' },
                ].map((s, i) => (
                  <div key={i} ref={s.ref}
                    className={`flex items-center justify-between px-6 py-5 ${i < 3 ? 'border-b border-border' : ''}`}>
                    <span className="text-[13px] font-medium tracking-[0.04em] uppercase text-text-2">{s.label}</span>
                    <span className="font-[family-name:var(--font-display)] text-3xl text-text-1">{s.value}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative py-24 sm:py-32 px-6 sm:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="mb-16">
            <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-accent">Features</span>
            <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl text-text-1 mt-3 mb-4">Built around how you actually live</h2>
            <p className="text-text-2 max-w-xl text-lg">Not another generic management tool. Every feature exists because a real student needed it.</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <FadeIn key={idx} delay={idx * 0.06}>
                  <div className="card p-6 h-full group hover-target">
                    <div className="w-10 h-10 rounded-lg bg-accent-bg border border-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-1 mb-2 font-[family-name:var(--font-sans)]">{f.title}</h3>
                    <p className="text-sm text-text-2 leading-relaxed">{f.desc}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative py-24 sm:py-32 px-6 sm:px-8 bg-surface border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-accent">How it works</span>
            <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl text-text-1 mt-3 mb-16">Three steps to better living</h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Sign up & set preferences', desc: 'Tell us your sleep schedule, cleanliness level, and noise tolerance. Takes 30 seconds.' },
              { step: '02', title: 'Get matched & book', desc: "We'll find your ideal room and roommate. Browse options, pick one, and you're set." },
              { step: '03', title: 'Live & give feedback', desc: 'Pay rent, file complaints if needed, and rate your roommate when you leave.' },
            ].map((s, idx) => (
              <FadeIn key={idx} delay={idx * 0.1}>
                <div className="text-center">
                  <div className="font-[family-name:var(--font-display)] text-5xl text-accent/40 mb-4">{s.step}</div>
                  <h3 className="text-lg font-semibold text-text-1 mb-2">{s.title}</h3>
                  <p className="text-sm text-text-2 leading-relaxed">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 sm:py-32 px-6 sm:px-8 border-t border-border">
        <FadeIn className="max-w-2xl mx-auto text-center">
          <div className="card p-12 sm:p-16 border-accent/20 bg-accent-bg/30">
            <Heart className="w-8 h-8 text-accent mx-auto mb-6" />
            <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl text-text-1 mb-4">Ready to find your place?</h2>
            <p className="text-text-2 max-w-md mx-auto mb-8">Join hundreds of students already living smarter with Stayza.</p>
            <Link to="/register">
              <button className="inline-flex items-center gap-2 bg-accent text-bg font-semibold text-[15px] px-7 py-3.5 rounded-lg hover:bg-accent-dim hover:scale-[1.02] transition-all mx-auto">
                Create your free account <ArrowRight className="w-4.5 h-4.5" />
              </button>
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-8 px-6 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <StayzaLogo size={26} showText={true} />
          <p className="text-xs text-text-3">© 2026 Stayza. Built for student living.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
