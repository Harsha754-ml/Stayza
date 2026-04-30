import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, ArrowLeft, Bed, AlertCircle, CreditCard, Users, Star, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { complaintService, roomService, paymentService, authService, feedbackService } from '../../services/api';

interface Message { id: string; text: string; sender: 'user' | 'bot'; timestamp: Date; }

const chips = [
  { label: 'My room', icon: Bed, query: 'room' },
  { label: 'Complaints', icon: AlertCircle, query: 'complaints' },
  { label: 'Payments', icon: CreditCard, query: 'payments' },
  { label: 'Roommates', icon: Users, query: 'roommates' },
  { label: 'My reputation', icon: Star, query: 'reputation' },
  { label: 'How matching works', icon: HelpCircle, query: 'how matching' },
];

const Chatbot: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Hey! I'm your hostel assistant. Ask me anything about your room, complaints, payments, or roommates — or tap a quick action below.", sender: 'bot', timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const addBot = (text: string) => {
    setMessages(prev => [...prev, { id: String(Date.now()), text, sender: 'bot', timestamp: new Date() }]);
  };

  const handleSend = async (queryOverride?: string) => {
    const q = (queryOverride || input).trim().toLowerCase();
    if (!q) return;

    if (!queryOverride) {
      setMessages(prev => [...prev, { id: String(Date.now()), text: input, sender: 'user', timestamp: new Date() }]);
      setInput('');
    } else {
      setMessages(prev => [...prev, { id: String(Date.now()), text: queryOverride, sender: 'user', timestamp: new Date() }]);
    }

    setTyping(true);
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));

    try {
      if (q.includes('room') || q.includes('booking')) {
        const res = await roomService.myBookings();
        const bookings = res.data.results || res.data;
        const active = bookings.find((b: { is_active: boolean }) => b.is_active);
        addBot(active
          ? `You're in **Room ${active.room_detail.number}** (${active.room_detail.room_type}, Floor ${active.room_detail.floor}). Rent: ₹${Number(active.room_detail.price_per_month).toLocaleString()}/mo.`
          : "You don't have a room yet. Head to **Book Room** in the sidebar to find one!");

      } else if (q.includes('complaint')) {
        const res = await complaintService.mine();
        const list = (res.data.results || res.data) as Array<{ id: number; title: string; status: string; priority: string }>;
        const active = list.filter(c => c.status !== 'resolved');
        if (active.length === 0) {
          addBot("No active complaints — everything's good! If something comes up, use the **Complaints** page to file one.");
        } else {
          const lines = active.map(c => `• #${c.id} "${c.title}" — ${c.status.replace('_', ' ')} (${c.priority})`).join('\n');
          addBot(`You have **${active.length}** active complaint${active.length > 1 ? 's' : ''}:\n\n${lines}`);
        }

      } else if (q.includes('pay') || q.includes('due') || q.includes('rent')) {
        const res = await paymentService.mine();
        const list = (res.data.results || res.data) as Array<{ status: string; amount: string; month: string }>;
        const pending = list.filter(p => p.status !== 'paid');
        if (pending.length === 0) {
          addBot("All payments are up to date! 🎉");
        } else {
          const total = pending.reduce((s, p) => s + Number(p.amount), 0);
          addBot(`You have **${pending.length}** pending payment${pending.length > 1 ? 's' : ''} totaling **₹${total.toLocaleString()}**. Head to **Payments** to clear them.`);
        }

      } else if (q.includes('roommate') || q.includes('match')) {
        const res = await authService.roommateMatches();
        const matches = res.data as Array<{ user: { full_name: string }; score: number }>;
        if (matches.length === 0) {
          addBot("No matches found yet. Make sure your preferences are set in your **Profile**.");
        } else {
          const top3 = matches.slice(0, 3).map((m, i) => `${i + 1}. **${m.user.full_name}** — ${m.score}% match`).join('\n');
          addBot(`Your top roommate matches:\n\n${top3}\n\nSee all matches on the **Roommate Match** page.`);
        }

      } else if (q.includes('reputation') || q.includes('rating') || q.includes('feedback')) {
        const res = await feedbackService.received();
        const list = res.data.results || res.data;
        if (list.length === 0) {
          addBot("No reviews yet. Your roommates can rate you after they check out.");
        } else {
          const avg = (list.reduce((s: number, f: { overall_rating: number }) => s + f.overall_rating, 0) / list.length).toFixed(1);
          addBot(`You have **${list.length}** review${list.length > 1 ? 's' : ''} with an average rating of **${avg}★**. Check the **Feedback** page for details.`);
        }

      } else if (q.includes('how') && q.includes('match')) {
        addBot("The matching algorithm scores each candidate:\n\n• **Sleep schedule** — same or flexible = 100%\n• **Cleanliness** — closer levels = higher score\n• **Noise tolerance** — closer levels = higher score\n• **Peer reputation** — ratings from past roommates\n\nFinal score = **70% preferences + 30% reputation**. Students with great reviews rank higher!");

      } else if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
        addBot("Hey there! 👋 What can I help you with? Try asking about your room, complaints, payments, or roommates.");

      } else if (q.includes('thank')) {
        addBot("You're welcome! Let me know if you need anything else. 😊");

      } else {
        addBot("I can help with:\n\n• **Room** — your current booking\n• **Complaints** — status of your issues\n• **Payments** — pending dues\n• **Roommates** — top matches\n• **Reputation** — your ratings\n• **How matching works** — the algorithm\n\nTry asking one of these!");
      }
    } catch {
      addBot("Oops, I had trouble fetching that. Make sure the backend is running and try again.");
    }
    setTyping(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-lg bg-overlay flex items-center justify-center text-text-2 hover:text-text-1 transition-colors">
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <div className="w-9 h-9 rounded-lg bg-accent-glow flex items-center justify-center">
          <Bot className="w-5 h-5 text-accent" strokeWidth={1.5} />
        </div>
        <div>
          <div className="text-[15px] font-semibold text-text-1">AI Assistant</div>
          <div className="text-[11px] text-text-2">Powered by your real hostel data</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-2.5 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  msg.sender === 'user' ? 'bg-overlay' : 'bg-accent-glow'
                }`}>
                  {msg.sender === 'user'
                    ? <User className="w-3.5 h-3.5 text-text-2" strokeWidth={1.5} />
                    : <Bot className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />}
                </div>
                <div className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-accent text-white rounded-tr-md'
                    : 'bg-elevated border border-border text-text-1 rounded-tl-md'
                }`}>
                  {msg.text.split('**').map((part, i) =>
                    i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : <span key={i}>{part}</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {typing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent-glow flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
            </div>
            <div className="bg-elevated border border-border rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-1">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-text-2"
                  animate={{ y: [0, -4, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick chips */}
      <div className="flex gap-2 flex-wrap pb-3">
        {chips.map((c, i) => {
          const Icon = c.icon;
          return (
            <button key={i} onClick={() => handleSend(c.query)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-elevated border border-border text-[12px] font-medium text-text-2 hover:text-text-1 hover:border-border-strong transition-all duration-150">
              <Icon className="w-3 h-3" strokeWidth={1.5} /> {c.label}
            </button>
          );
        })}
      </div>

      {/* Input */}
      <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="relative">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} disabled={typing}
          placeholder="Ask me anything..."
          className="w-full bg-elevated border border-border rounded-xl py-3.5 pl-4 pr-12 text-[14px] text-text-1 placeholder-text-3 focus:outline-none focus:border-accent/40 transition-colors disabled:opacity-50" />
        <button type="submit" disabled={!input.trim() || typing}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white hover:bg-accent-dim transition-colors disabled:opacity-30">
          <Send className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
