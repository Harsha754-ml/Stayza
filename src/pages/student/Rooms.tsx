import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BedDouble, ArrowRight, Loader2, Users, Layers, IndianRupee, Check, Wifi, ShowerHead, Wind } from 'lucide-react';
import { roomService } from '../../services/api';

interface Room {
  id: number;
  number: string;
  floor: number;
  room_type: string;
  capacity: number;
  price_per_month: string;
  status: string;
  occupant_count: number;
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const typeGradient: Record<string, string> = {
  single: 'from-blue-500 to-cyan-500',
  double: 'from-purple-500 to-pink-500',
  triple: 'from-orange-500 to-amber-500',
  premium: 'from-yellow-400 to-amber-500',
};

const amenities = [
  { icon: Wifi, label: 'Wi-Fi' },
  { icon: ShowerHead, label: 'Attached Bath' },
  { icon: Wind, label: 'AC' },
];

const Rooms: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    roomService.list().then(res => {
      setRooms(res.data.results || res.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleConfirm = async () => {
    if (!selectedRoom) return;
    setBooking(true);
    setError('');
    try {
      await roomService.book(selectedRoom);
      navigate('/student/payment');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || 'Booking failed.');
    } finally { setBooking(false); }
  };

  const isAvailable = (r: Room) => r.occupant_count < r.capacity && r.status !== 'maintenance';
  const filtered = filterType === 'all' ? rooms : rooms.filter(r => r.room_type === filterType);
  const types = ['all', ...new Set(rooms.map(r => r.room_type))];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-64 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const selectedRoomData = rooms.find(r => r.id === selectedRoom);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={item}>
        <div className="flex items-center gap-2 text-primary-400 text-sm font-medium mb-1">
          <BedDouble className="w-4 h-4" /> Room Booking
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Find Your Room</h1>
        <p className="text-gray-500 mt-2">Browse available rooms and book your ideal living space.</p>
      </motion.div>

      {error && (
        <motion.div variants={item} className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</motion.div>
      )}

      {/* Filters */}
      <motion.div variants={item} className="flex gap-2 flex-wrap">
        {types.map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all hover-target capitalize ${
              filterType === t ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] border border-white/[0.06]'
            }`}>
            {t === 'all' ? 'All Rooms' : t}
          </button>
        ))}
      </motion.div>

      {/* Room Grid */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((room) => {
          const avail = isAvailable(room);
          const selected = room.id === selectedRoom;
          const gradient = typeGradient[room.room_type] || 'from-gray-500 to-gray-600';
          return (
            <motion.div key={room.id} whileHover={avail ? { y: -6, scale: 1.02 } : {}} whileTap={avail ? { scale: 0.98 } : {}}
              onClick={() => avail && setSelectedRoom(selected ? null : room.id)}
              className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
                !avail ? 'opacity-40 cursor-not-allowed' :
                selected ? 'ring-2 ring-primary-400 shadow-lg shadow-primary-500/20 cursor-pointer' :
                'cursor-pointer hover-target'
              }`}>
              {/* Card background */}
              <div className="absolute inset-0 glass" />
              {selected && <div className="absolute inset-0 bg-primary-500/[0.05]" />}
              
              <div className="relative z-10 p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                    <BedDouble className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-white">₹{Number(room.price_per_month).toLocaleString()}</div>
                    <div className="text-[10px] text-gray-500 font-medium">per month</div>
                  </div>
                </div>

                {/* Info */}
                <h3 className="text-lg font-bold text-white mb-1">Room {room.number}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1 capitalize"><Layers className="w-3 h-3" />{room.room_type}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{room.occupant_count}/{room.capacity}</span>
                  <span>Floor {room.floor}</span>
                </div>

                {/* Amenities */}
                <div className="flex gap-2 mb-4">
                  {amenities.map((a, i) => (
                    <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] text-[10px] text-gray-400">
                      <a.icon className="w-3 h-3" />{a.label}
                    </div>
                  ))}
                </div>

                {/* Occupancy bar */}
                <div className="mb-4">
                  <div className="w-full h-1.5 rounded-full bg-white/[0.06]">
                    <div className={`h-1.5 rounded-full transition-all ${
                      room.occupant_count >= room.capacity ? 'bg-red-500' : room.occupant_count > 0 ? 'bg-yellow-500' : 'bg-green-500'
                    }`} style={{ width: `${(room.occupant_count / room.capacity) * 100}%` }} />
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    avail ? 'bg-green-500/15 text-green-400' : room.status === 'maintenance' ? 'bg-gray-500/15 text-gray-400' : 'bg-red-500/15 text-red-400'
                  }`}>
                    {avail ? 'Available' : room.status === 'maintenance' ? 'Maintenance' : 'Full'}
                  </span>
                  {selected && (
                    <span className="flex items-center gap-1.5 text-primary-400 text-xs font-bold">
                      <Check className="w-4 h-4" /> Selected
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Sticky Booking Bar */}
      {selectedRoom && (
        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-xl">
          <div className="glass rounded-2xl p-4 flex items-center justify-between shadow-2xl border border-primary-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center">
                <BedDouble className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Room {selectedRoomData?.number}</div>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" />{Number(selectedRoomData?.price_per_month).toLocaleString()}/mo
                </div>
              </div>
            </div>
            <button onClick={handleConfirm} disabled={booking}
              className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all hover-target disabled:opacity-50">
              {booking ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Confirm Booking <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Rooms;
