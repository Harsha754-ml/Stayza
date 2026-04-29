import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { complaintService, roomService, paymentService } from '../../services/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello! I\'m your AI Hostel Assistant. Ask me about your room, complaints, payments, or anything else.', sender: 'bot', timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    const query = input.toLowerCase();
    setInput('');
    setIsTyping(true);

    let response = '';
    try {
      if (query.includes('complaint')) {
        const res = await complaintService.mine();
        const complaints = res.data.results || res.data;
        const active = complaints.filter((c: { status: string }) => c.status !== 'resolved');
        response = active.length > 0
          ? `You have ${active.length} active complaint(s):\n${active.map((c: { id: number; title: string; status: string }) => `• #${c.id}: ${c.title} (${c.status.replace('_', ' ')})`).join('\n')}`
          : 'You have no active complaints. Would you like to file one?';
      } else if (query.includes('room') || query.includes('booking')) {
        const res = await roomService.myBookings();
        const bookings = res.data.results || res.data;
        const active = bookings.find((b: { is_active: boolean }) => b.is_active);
        response = active
          ? `You're currently in Room ${active.room_detail.number} (${active.room_detail.room_type}, Floor ${active.room_detail.floor}).`
          : 'You don\'t have an active room booking. Visit the Rooms page to book one.';
      } else if (query.includes('payment') || query.includes('dues') || query.includes('pay')) {
        const res = await paymentService.mine();
        const payments = res.data.results || res.data;
        const pending = payments.filter((p: { status: string }) => p.status !== 'paid');
        response = pending.length > 0
          ? `You have ${pending.length} pending payment(s) totaling ₹${pending.reduce((s: number, p: { amount: string }) => s + Number(p.amount), 0).toLocaleString()}.`
          : 'All your payments are up to date!';
      } else {
        response = 'I can help you with:\n• **Complaints** — check status or file new ones\n• **Room** — view your current booking\n• **Payments** — check pending dues\n\nJust ask!';
      }
    } catch {
      response = 'Sorry, I had trouble fetching that information. Please try again.';
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: response, sender: 'bot', timestamp: new Date() }]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto bg-surface/30 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
      <div className="bg-surface/80 border-b border-white/5 p-6 flex items-center z-10">
        <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mr-4">
          <Bot className="w-6 h-6 text-primary-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">AI Assistant</h2>
          <p className="text-sm text-gray-400">Ask about rooms, complaints, or payments</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.sender === 'user' ? 'bg-white/10 ml-3' : 'bg-primary-500/20 mr-3'
                }`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-primary-400" />}
                </div>
                <div className={`p-4 rounded-2xl whitespace-pre-wrap ${
                  msg.sender === 'user' ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-white/5 text-gray-200 border border-white/5 rounded-tl-none'
                }`}>
                  <p className="leading-relaxed">{msg.text}</p>
                  <div className={`text-xs mt-2 ${msg.sender === 'user' ? 'text-primary-200' : 'text-gray-500'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
              <div className="flex flex-row max-w-[80%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500/20 mr-3 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary-400" />
                </div>
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none flex items-center space-x-2">
                  <motion.div className="w-2 h-2 bg-primary-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                  <motion.div className="w-2 h-2 bg-primary-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                  <motion.div className="w-2 h-2 bg-primary-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-surface/80 border-t border-white/5 z-10">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            placeholder="Type your message..." disabled={isTyping}
            className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-4 pr-16 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all hover-target" />
          <button type="submit" disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 bg-primary-500 hover:bg-primary-400 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover-target">
            {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
