import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Users, CreditCard, Star, MessageSquare, BarChart3 } from 'lucide-react';
import StayzaLogo from '../components/ui/StayzaLogo';
import Galaxy from '../components/animations/Galaxy';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

const features = [
  { icon: Users, title: 'AI Roommate Matching', desc: 'Smart algorithm scores compatibility based on sleep schedule, cleanliness, noise tolerance, and peer reviews.', gradient: 'from-purple-500 to-pink-500', glow: 'bg-purple-500/20' },
  { icon: ShieldCheck, title: 'Auto-Escalation', desc: 'Complaints unresolved for 48h automatically escalate in priority. No issue gets forgotten.', gradient: 'from-red-500 to-orange-500', glow: 'bg-red-500/20' },
  { icon: CreditCard, title: 'Payment Tracking', desc: 'Track rent payments, pending dues, and overdue accounts. Pay via card or UPI in one click.', gradient: 'from-blue-500 to-cyan-500', glow: 'bg-blue-500/20' },
  { icon: Star, title: 'Peer Feedback', desc: 'Rate roommates after checkout. Ratings feed into the matching algorithm for better future matches.', gradient: 'from-yellow-500 to-amber-500', glow: 'bg-yellow-500/20' },
  { icon: MessageSquare, title: 'AI Assistant', desc: 'Chat with our AI to check complaints, room status, and payment info instantly.', gradient: 'from-primary-500 to-blue-500', glow: 'bg-primary-500/20' },
  { icon: BarChart3, title: 'Admin Dashboard', desc: 'Real-time analytics, room allocation grid, staff management, and complaint queue.', gradient: 'from-green-500 to-emerald-500', glow: 'bg-green-500/20' },
];

const stats = [
  { value: '500+', label: 'Students Housed' },
  { value: '98%', label: 'Match Accuracy' },
  { value: '<2h', label: 'Avg Resolution' },
  { value: '4.8★', label: 'Student Rating' },
];

const Landing: React.FC = () => {
  return (
    <div className="relative w-full min-h-screen bg-background text-white flex flex-col">
      {/* Galaxy Background */}
      <div className="fixed inset-0 z-0">
        <Galaxy transparent={true} density={1.2} starSpeed={0.2} hueShift={180} />
      </div>

      {/* Gradient orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary-500/[0.07] blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/[0.05] blur-[150px]" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-purple-500/[0.04] blur-[120px]" />
      </div>

      <main className="relative z-10 w-full">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-6 pt-24">
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div variants={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.08] backdrop-blur-md mb-8">
              <StayzaLogo size={22} showText={false} />
              <span className="text-sm font-medium text-gray-300">Intelligent PG & Hostel Management</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={item} className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-8">
              <span className="text-white">Where Students</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-blue-400 to-purple-400">
                Live Smarter
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p variants={item} className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              AI-powered roommate matching, automated complaint resolution, seamless payments, and peer feedback — all in one platform built for modern hostel living.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="group relative px-8 py-4 bg-gradient-to-r from-primary-500 to-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-shadow flex items-center gap-2 hover-target">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <Link to="/login">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/[0.05] border border-white/[0.1] text-white font-semibold rounded-2xl hover:bg-white/[0.08] transition-all hover-target backdrop-blur-sm">
                  Sign In
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats Row */}
            <motion.div variants={item} className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-2xl sm:text-3xl font-black text-white">{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }} className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Features
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">Everything you need</h2>
              <p className="text-gray-400 max-w-xl mx-auto">A complete platform for hostel management — from room allocation to complaint resolution.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <motion.div key={idx}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: idx * 0.08 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group relative overflow-hidden rounded-2xl glass glass-hover p-7 hover-target">
                    {/* Glow */}
                    <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full ${feature.glow} blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    <div className="relative z-10">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">{feature.title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} className="max-w-4xl mx-auto text-center">
            <div className="relative rounded-3xl overflow-hidden p-12 sm:p-16">
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-blue-500/10 to-purple-500/10 border border-white/[0.08] rounded-3xl" />
              <div className="absolute inset-0 backdrop-blur-sm" />
              
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">Ready to get started?</h2>
                <p className="text-gray-400 max-w-lg mx-auto mb-8">Join hundreds of students already using Stayza for a better hostel experience.</p>
                <Link to="/register">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="group px-10 py-4 bg-white text-background font-bold rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2 mx-auto hover-target">
                    Create Free Account
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/[0.06] py-8 px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <StayzaLogo size={28} showText={true} />
            <p className="text-xs text-gray-600">© 2026 Stayza. Built for modern hostel living.</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Landing;
