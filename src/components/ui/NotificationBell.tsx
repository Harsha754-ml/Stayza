import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertCircle, CreditCard, Star, MessageSquare, Flame, X } from 'lucide-react';
import { notificationService } from '../../services/api';

interface Notification {
  id: string; type: string; title: string; message: string; time: string; read: boolean;
}

const typeIcon: Record<string, React.ElementType> = {
  complaint_update: AlertCircle, complaint_pending: AlertCircle,
  payment_due: CreditCard, feedback_pending: Star,
  welcome: MessageSquare, escalated: Flame, unassigned: AlertCircle, overdue: CreditCard,
};

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetch = () => {
      notificationService.list().then(res => {
        setNotifications(res.data.notifications || []);
        setUnread(res.data.unread_count || 0);
      }).catch(() => {});
    };
    fetch();
    const interval = setInterval(fetch, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const timeAgo = (iso: string) => {
    const h = (Date.now() - new Date(iso).getTime()) / 3600000;
    if (h < 1) return `${Math.round(h * 60)}m ago`;
    if (h < 24) return `${Math.round(h)}h ago`;
    return `${Math.round(h / 24)}d ago`;
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => { setOpen(!open); if (!open) setUnread(0); }}
        className="relative w-9 h-9 rounded-lg flex items-center justify-center text-text-2 hover:bg-overlay hover:text-text-1 transition-all duration-150">
        <Bell className="w-4 h-4" strokeWidth={1.5} />
        {unread > 0 && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent text-[9px] font-bold text-white flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 bg-elevated border border-border rounded-xl overflow-hidden z-50 shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between px-4 h-11 border-b border-border">
              <span className="text-[13px] font-semibold text-text-1">Notifications</span>
              <button onClick={() => setOpen(false)} className="text-text-3 hover:text-text-2 transition-colors">
                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-[13px] text-text-2">All caught up!</div>
              ) : notifications.map((n, i) => {
                const Icon = typeIcon[n.type] || Bell;
                return (
                  <div key={n.id} className={`flex gap-3 px-4 py-3 hover:bg-overlay transition-colors duration-150 ${
                    i < notifications.length - 1 ? 'border-b border-border' : ''
                  } ${!n.read ? 'bg-accent-glow/30' : ''}`}>
                    <div className="w-7 h-7 rounded-lg bg-overlay flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className={`w-3.5 h-3.5 ${n.type === 'escalated' ? 'text-red' : n.type.includes('payment') ? 'text-yellow' : 'text-text-2'}`} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-text-1 leading-tight">{n.title}</div>
                      <div className="text-[12px] text-text-2 mt-0.5 leading-snug">{n.message}</div>
                      <div className="text-[11px] text-text-3 mt-1">{timeAgo(n.time)}</div>
                    </div>
                    {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
