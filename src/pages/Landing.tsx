import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import Hero3D from '../components/animations/Hero3D';
import Galaxy from '../components/animations/Galaxy';

const Landing: React.FC = () => {
  return (
    <div className="relative w-full min-h-screen bg-background text-white selection:bg-primary-500 selection:text-background flex flex-col pt-24">
      {/* 3D Background / Ambient Glow */}
      <div className="fixed inset-0 z-0">
        <Galaxy transparent={true} density={1.5} starSpeed={0.3} hueShift={180} />
      </div>

      <main className="flex-1 flex flex-col z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 relative pointer-events-none">
        
        {/* Hero Section */}
        <section className="flex-1 flex flex-col lg:flex-row items-center justify-center min-h-[80vh] gap-12 lg:gap-8">
          
          {/* Left Column: Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 flex flex-col justify-center items-start pt-12 lg:pt-0"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-primary-400 mr-2" />
              <span className="text-sm font-medium text-gray-300">Intelligent Student Housing</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
              NextGen <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-500">Hostel Living</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-400 max-w-xl mb-10 leading-relaxed">
              AI-powered roommate matching, smart complaint resolution, and a seamless living experience designed for the modern student.
            </p>
            
            <Link to="/register" className="pointer-events-auto">
              <button className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-black bg-primary-500 rounded-full overflow-hidden transition-all hover:scale-105 hover-target focus:outline-none focus:ring-4 focus:ring-primary-500/50">
                <span className="relative z-10 flex items-center">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 h-full w-full bg-white/20 scale-0 rounded-full transition-all duration-300 ease-out group-hover:scale-100 z-0"></div>
              </button>
            </Link>
          </motion.div>

          {/* Right Column: 3D Object Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex-1 w-full h-[50vh] lg:h-[80vh] relative flex items-center justify-center pointer-events-auto"
          >
            <Hero3D />
          </motion.div>
          
        </section>

        {/* Features Section */}
        <section className="py-24 w-full pointer-events-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Feature Card 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="group bg-surface border border-white/5 p-8 rounded-3xl shadow-xl hover:shadow-primary-500/10 hover:border-white/10 transition-all hover:-translate-y-2 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-[50px] -mr-16 -mt-16 transition-all group-hover:bg-primary-500/20" />
              <div className="w-14 h-14 rounded-2xl bg-primary-500/20 flex items-center justify-center mb-6 border border-primary-500/30">
                <Sparkles className="w-7 h-7 text-primary-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Smart Matchmaking</h2>
              <p className="text-gray-400 leading-relaxed">
                Our NLP-driven AI analyzes your personal preferences and lifestyle habits to find the perfect roommate, ensuring a harmonious living experience from day one.
              </p>
            </motion.div>

            {/* Feature Card 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group bg-surface border border-white/5 p-8 rounded-3xl shadow-xl hover:shadow-blue-500/10 hover:border-white/10 transition-all hover:-translate-y-2 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[50px] -mr-16 -mt-16 transition-all group-hover:bg-blue-500/20" />
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-500/30">
                <ShieldCheck className="w-7 h-7 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Automated Resolution</h2>
              <p className="text-gray-400 leading-relaxed">
                Complaints are automatically prioritized and assigned using advanced rule-based engines, featuring built-in escalation protocols for critical issues.
              </p>
            </motion.div>

          </div>
        </section>

      </main>
    </div>
  );
};

export default Landing;
