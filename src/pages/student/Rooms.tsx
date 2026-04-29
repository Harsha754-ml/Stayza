import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BedDouble, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
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

const Rooms: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

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
    } finally {
      setBooking(false);
    }
  };

  const available = (r: Room) => r.occupant_count < r.capacity && r.status !== 'maintenance';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Room Allocation</h1>
        <p className="text-gray-400">Browse available rooms and book your ideal living space.</p>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-surface/50 border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center">
            <ShieldCheck className="w-10 h-10 text-primary-500 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">AI Matchmaking Active</h3>
            <p className="text-sm text-gray-400">Our algorithm prioritizes rooms with roommates matching your preferences.</p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms.map((room) => (
              <div key={room.id}
                onClick={() => available(room) && setSelectedRoom(room.id)}
                className={`p-6 rounded-2xl border transition-all ${
                  !available(room)
                    ? 'opacity-50 cursor-not-allowed bg-black/20 border-white/5'
                    : room.id === selectedRoom
                    ? 'bg-primary-500/10 border-primary-500 shadow-[0_0_20px_rgba(0,209,255,0.15)] cursor-pointer'
                    : 'bg-surface/50 border-white/5 hover:border-white/20 hover:bg-surface/80 cursor-pointer hover-target'
                }`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white/5 rounded-xl">
                    <BedDouble className={`w-6 h-6 ${room.id === selectedRoom ? 'text-primary-400' : 'text-gray-400'}`} />
                  </div>
                  <span className="font-bold text-lg text-white">₹{Number(room.price_per_month).toLocaleString()}/mo</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Room {room.number} — {room.room_type}</h3>
                <p className="text-sm text-gray-400 mb-4">Floor {room.floor} · Occupancy: {room.occupant_count}/{room.capacity}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    available(room) ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {available(room) ? 'Available' : room.status === 'maintenance' ? 'Maintenance' : 'Full'}
                  </span>
                  {room.id === selectedRoom && (
                    <span className="text-primary-400 text-sm font-bold flex items-center">
                      Selected <div className="w-2 h-2 rounded-full bg-primary-500 ml-2 animate-pulse" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-surface/50 border border-white/5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Selected Room</p>
              <p className="text-lg font-bold text-white">
                {selectedRoom ? `Room ${rooms.find(r => r.id === selectedRoom)?.number}` : 'None'}
              </p>
            </div>
            <button onClick={handleConfirm} disabled={!selectedRoom || booking}
              className="group relative inline-flex items-center justify-center px-8 py-3 font-bold text-black bg-primary-500 rounded-full overflow-hidden transition-all hover:scale-105 hover-target disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
              <span className="relative z-10 flex items-center">
                {booking ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Confirm & Book<ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
              </span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Rooms;
