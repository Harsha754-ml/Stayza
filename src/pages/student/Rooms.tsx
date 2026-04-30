import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BedDouble, ArrowRight, Loader2, Users, Layers, IndianRupee, Check, Wifi, ShowerHead, Wind, CreditCard, Wallet, Sparkles, Home, PartyPopper } from 'lucide-react';
import { roomService } from '../../services/api';

interface Room {
  id: number; number: string; floor: number; room_type: string;
  capacity: number; price_per_month: string; status: string; occupant_count: number;
}

type FlowStep = 'browse' | 'booked' | 'paying' | 'confirmed';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const typeGradient: Record<string, string> = {
  single: 'text-info', double: 'text-accent', triple: 'text-warning', premium: 'text-success',
};

const amenities = [
  { icon: Wifi, label: 'Wi-Fi' },
  { icon: ShowerHead, label: 'Bath' },
  { icon: Wind, label: 'AC' },
];

/* ── Confetti particles ── */
const Confetti: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {Array.from({ length: 24 }).map((_, i) => (
      <motion.div key={i}
        initial={{ y: -20, x: `${10 + Math.random() * 80}%`, opacity: 1, scale: 1, rotate: 0 }}
        animate={{ y: '110vh', opacity: 0, rotate: 360 + Math.random() * 360, scale: Math.random() * 0.5 + 0.5 }}
        transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5, ease: 'easeIn' }}
        className="absolute w-2 h-2 rounded-sm"
        style={{ backgroundColor: ['#FF6B35', '#4ADE80', '#FACC15', '#60A5FA', '#F87171', '#A78BFA'][i % 6], left: `${Math.random() * 100}%` }}
      />
    ))}
  </div>
);

/* ── Animated checkmark ── */
const AnimatedCheck: React.FC<{ size?: number }> = ({ size = 64 }) => (
  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
    transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
    className="relative">
    <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-full bg-success/10 border-2 border-success/30 flex items-center justify-center"
      style={{ width: size, height: size }}>
      <motion.svg width={size * 0.45} height={size * 0.45} viewBox="0 0 24 24" fill="none"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}>
        <motion.path d="M4 12l6 6L20 6" stroke="#4ADE80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }} />
      </motion.svg>
    </motion.div>
    {/* Pulse ring */}
    <motion.div initial={{ scale: 0.8, opacity: 0.6 }} animate={{ scale: 2, opacity: 0 }}
      transition={{ duration: 1, delay: 0.3 }}
      className="absolute inset-0 rounded-full border-2 border-success/40" />
  </motion.div>
);

/* ── Spinning loader ── */
const PaymentSpinner: React.FC = () => (
  <div className="flex flex-col items-center gap-4">
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
      className="w-12 h-12 rounded-full border-2 border-border border-t-accent" />
    <motion.p initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="text-sm text-text-2">Processing payment...</motion.p>
  </div>
);

const Rooms: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [payMethod, setPayMethod] = useState<'card' | 'upi'>('card');

  // Flow state
  const [step, setStep] = useState<FlowStep>('browse');
  const [bookedRoom, setBookedRoom] = useState<Room | null>(null);

  useEffect(() => {
    roomService.list().then(res => {
      setRooms(res.data.results || res.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleBook = async () => {
    if (!selectedRoom) return;
    setBooking(true);
    setError('');
    try {
      await roomService.book(selectedRoom);
      setBookedRoom(rooms.find(r => r.id === selectedRoom) || null);
      setStep('booked');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || 'Booking failed. You may already have a room.');
    } finally { setBooking(false); }
  };

  const handlePay = () => {
    setStep('paying');
    // Simulate payment processing
    setTimeout(() => setStep('confirmed'), 2500);
  };

  const isAvailable = (r: Room) => r.occupant_count < r.capacity && r.status !== 'maintenance';
  const filtered = filterType === 'all' ? rooms : rooms.filter(r => r.room_type === filterType);
  const types = ['all', ...new Set(rooms.map(r => r.room_type))];
  const selectedRoomData = rooms.find(r => r.id === selectedRoom);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-56 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {/* ── STEP: BOOKED — show room + pay button ── */}
      {step === 'booked' && bookedRoom && (
        <motion.div key="booked" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }}
          className="max-w-lg mx-auto mt-12 text-center relative">
          <Confetti />
          <AnimatedCheck size={72} />
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="font-[family-name:var(--font-display)] text-3xl text-text-1 mt-6 mb-2">
            Room {bookedRoom.number} is yours!
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="text-text-2 mb-8">
            {bookedRoom.room_type} room on Floor {bookedRoom.floor}. Now let's secure it with payment.
          </motion.p>

          {/* Room summary card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
            className="card p-6 text-left mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-bg border border-accent/20 flex items-center justify-center">
                  <BedDouble className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-text-1">Room {bookedRoom.number}</div>
                  <div className="text-xs text-text-3 capitalize">{bookedRoom.room_type} · Floor {bookedRoom.floor}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-0.5 text-xl font-bold text-text-1">
                  <IndianRupee className="w-4 h-4" />{Number(bookedRoom.price_per_month).toLocaleString()}
                </div>
                <div className="text-[10px] text-text-3">per month</div>
              </div>
            </div>
            <div className="flex gap-2">
              {amenities.map((a, i) => (
                <span key={i} className="flex items-center gap-1 px-2 py-1 rounded bg-surface-2 text-[10px] text-text-2">
                  <a.icon className="w-3 h-3" />{a.label}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Payment method */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}
            className="flex gap-3 mb-4">
            {[
              { key: 'card' as const, label: 'Card', icon: CreditCard },
              { key: 'upi' as const, label: 'UPI', icon: Wallet },
            ].map(m => (
              <button key={m.key} onClick={() => setPayMethod(m.key)}
                className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                  payMethod === m.key ? 'bg-accent-bg border-accent/30 text-accent' : 'bg-surface border-border text-text-2 hover:border-border-light'
                }`}>
                <m.icon className="w-4 h-4" /> {m.label}
              </button>
            ))}
          </motion.div>

          {/* Pay button */}
          <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
            onClick={handlePay}
            className="w-full flex items-center justify-center gap-2 bg-accent text-bg font-semibold text-base py-4 rounded-xl hover:bg-accent-dim hover:scale-[1.02] transition-all">
            <Sparkles className="w-5 h-5" />
            Pay ₹{Number(bookedRoom.price_per_month).toLocaleString()} & confirm
          </motion.button>

          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
            onClick={() => navigate('/student/dashboard')}
            className="mt-3 text-sm text-text-3 hover:text-text-2 transition-colors">
            I'll pay later →
          </motion.button>
        </motion.div>
      )}

      {/* ── STEP: PAYING — spinner animation ── */}
      {step === 'paying' && (
        <motion.div key="paying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="max-w-sm mx-auto mt-32 text-center">
          <PaymentSpinner />
        </motion.div>
      )}

      {/* ── STEP: CONFIRMED — celebration ── */}
      {step === 'confirmed' && bookedRoom && (
        <motion.div key="confirmed" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 150, damping: 15 }}
          className="max-w-lg mx-auto mt-12 text-center relative">
          <Confetti />

          {/* Big animated check */}
          <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            className="w-24 h-24 rounded-full bg-success/15 border-2 border-success/30 flex items-center justify-center mx-auto mb-6">
            <PartyPopper className="w-10 h-10 text-success" />
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="font-[family-name:var(--font-display)] text-4xl text-text-1 mb-3">
            You're all set!
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="text-text-2 text-lg mb-2">
            Room <span className="text-accent font-semibold">{bookedRoom.number}</span> is confirmed and paid.
          </motion.p>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="text-text-3 text-sm mb-10">
            Welcome to your new home. Check your dashboard for all the details.
          </motion.p>

          {/* Summary card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            className="card p-5 mb-8 inline-flex items-center gap-4 mx-auto">
            <div className="w-12 h-12 rounded-xl bg-accent-bg border border-accent/20 flex items-center justify-center">
              <Home className="w-6 h-6 text-accent" />
            </div>
            <div className="text-left">
              <div className="text-base font-semibold text-text-1">Room {bookedRoom.number}</div>
              <div className="text-xs text-text-3 capitalize">{bookedRoom.room_type} · Floor {bookedRoom.floor} · ₹{Number(bookedRoom.price_per_month).toLocaleString()}/mo</div>
            </div>
            <div className="ml-4 px-3 py-1 rounded-lg bg-success/10 text-success text-xs font-semibold uppercase">
              Paid ✓
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}
            className="flex flex-col gap-3 items-center">
            <button onClick={() => navigate('/student/dashboard')}
              className="inline-flex items-center gap-2 bg-accent text-bg font-semibold text-sm px-8 py-3.5 rounded-lg hover:bg-accent-dim hover:scale-[1.02] transition-all">
              Go to your Dashboard <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/student/roommates')}
              className="text-sm text-text-2 hover:text-accent transition-colors">
              Find a roommate →
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* ── STEP: BROWSE — room grid ── */}
      {step === 'browse' && (
        <motion.div key="browse" variants={container} initial="hidden" animate="show" exit={{ opacity: 0 }}
          className="space-y-8">
          <motion.div variants={item}>
            <p className="text-sm text-text-3 mb-1">Room Booking</p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl text-text-1">Find your room</h1>
            <p className="text-text-2 mt-2">Browse available rooms and book your ideal living space.</p>
          </motion.div>

          {error && (
            <motion.div variants={item} className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-xl px-4 py-3">{error}</motion.div>
          )}

          <motion.div variants={item} className="flex gap-2 flex-wrap">
            {types.map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  filterType === t ? 'bg-accent-bg border border-accent/30 text-accent' : 'bg-surface border border-border text-text-2 hover:border-border-light'
                }`}>{t === 'all' ? 'All Rooms' : t}</button>
            ))}
          </motion.div>

          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((room) => {
              const avail = isAvailable(room);
              const selected = room.id === selectedRoom;
              return (
                <motion.div key={room.id} whileHover={avail ? { y: -4 } : {}} whileTap={avail ? { scale: 0.98 } : {}}
                  onClick={() => avail && setSelectedRoom(selected ? null : room.id)}
                  className={`card p-5 transition-all ${
                    !avail ? 'opacity-40 cursor-not-allowed' :
                    selected ? 'ring-2 ring-accent border-accent cursor-pointer' : 'cursor-pointer hover-target'
                  }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg bg-accent-bg border border-accent/20 flex items-center justify-center`}>
                      <BedDouble className={`w-5 h-5 ${typeGradient[room.room_type] || 'text-text-2'}`} />
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-text-1">₹{Number(room.price_per_month).toLocaleString()}</div>
                      <div className="text-[10px] text-text-3">per month</div>
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-text-1 mb-1">Room {room.number}</h3>
                  <div className="flex items-center gap-3 text-xs text-text-2 mb-3">
                    <span className="flex items-center gap-1 capitalize"><Layers className="w-3 h-3" />{room.room_type}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{room.occupant_count}/{room.capacity}</span>
                    <span>Floor {room.floor}</span>
                  </div>
                  <div className="flex gap-1.5 mb-3">
                    {amenities.map((a, i) => (
                      <span key={i} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-2 text-[9px] text-text-3">
                        <a.icon className="w-2.5 h-2.5" />{a.label}
                      </span>
                    ))}
                  </div>
                  <div className="w-full h-1 rounded-full bg-border mb-3">
                    <div className={`h-1 rounded-full transition-all ${
                      room.occupant_count >= room.capacity ? 'bg-danger' : room.occupant_count > 0 ? 'bg-warning' : 'bg-success'
                    }`} style={{ width: `${Math.max(5, (room.occupant_count / room.capacity) * 100)}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      avail ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                    }`}>{avail ? 'Available' : 'Full'}</span>
                    {selected && <span className="flex items-center gap-1 text-accent text-xs font-semibold"><Check className="w-3.5 h-3.5" /> Selected</span>}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Sticky booking bar */}
          <AnimatePresence>
            {selectedRoom && selectedRoomData && (
              <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-xl">
                <div className="card p-4 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.4)] border-accent/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent-bg border border-accent/20 flex items-center justify-center">
                      <BedDouble className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-text-1">Room {selectedRoomData.number}</div>
                      <div className="text-xs text-text-3 flex items-center gap-0.5">
                        <IndianRupee className="w-3 h-3" />{Number(selectedRoomData.price_per_month).toLocaleString()}/mo
                      </div>
                    </div>
                  </div>
                  <button onClick={handleBook} disabled={booking}
                    className="flex items-center gap-2 px-6 py-3 bg-accent text-bg font-semibold text-sm rounded-lg hover:bg-accent-dim hover:scale-[1.02] transition-all disabled:opacity-50">
                    {booking ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Book this room <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Rooms;
