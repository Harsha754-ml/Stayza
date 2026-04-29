import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BedDouble, User, UserPlus, Grid3X3, List } from 'lucide-react';
import { roomService } from '../../services/api';

interface Room {
  id: number;
  number: string;
  floor: number;
  room_type: string;
  capacity: number;
  status: string;
  occupant_count: number;
  occupants: Array<{ id: number; full_name: string }>;
  price_per_month: string;
}

const statusColors: Record<string, string> = {
  available: 'bg-green-500/20 border-green-500/30 text-green-400',
  partial: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
  occupied: 'bg-red-500/20 border-red-500/30 text-red-400',
  maintenance: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
};

const statusDot: Record<string, string> = {
  available: 'bg-green-400', partial: 'bg-yellow-400', occupied: 'bg-red-400', maintenance: 'bg-gray-500',
};

const Allocation: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  useEffect(() => {
    roomService.list().then(res => {
      setRooms(res.data.results || res.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = rooms.filter(r => selectedFloor === 'all' || r.floor === selectedFloor);
  const floors = [...new Set(rooms.map(r => r.floor))].sort();

  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    partial: rooms.filter(r => r.status === 'partial').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    occupancyRate: rooms.length ? Math.round((rooms.filter(r => r.status !== 'available' && r.status !== 'maintenance').length / rooms.length) * 100) : 0,
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Room Allocation</h1>
        <p className="text-gray-400">Live occupancy grid across all floors.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Rooms', value: stats.total, color: 'text-white' },
          { label: 'Available', value: stats.available, color: 'text-green-400' },
          { label: 'Partial', value: stats.partial, color: 'text-yellow-400' },
          { label: 'Full', value: stats.occupied, color: 'text-red-400' },
          { label: 'Occupancy', value: `${stats.occupancyRate}%`, color: 'text-primary-400' },
        ].map(s => (
          <div key={s.label} className="bg-surface/50 border border-white/5 rounded-2xl p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap text-xs">
          {Object.entries(statusDot).map(([s, dot]) => (
            <span key={s} className="flex items-center gap-1.5 text-gray-400 capitalize">
              <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />{s}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-white/5 rounded-xl p-1">
            {floors.map(f => (
              <button key={f} onClick={() => setSelectedFloor(selectedFloor === f ? 'all' : f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover-target ${
                  selectedFloor === f ? 'bg-primary-500/30 text-primary-400' : 'text-gray-400 hover:text-white'
                }`}>Floor {f}</button>
            ))}
            <button onClick={() => setSelectedFloor('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover-target ${
                selectedFloor === 'all' ? 'bg-primary-500/30 text-primary-400' : 'text-gray-400 hover:text-white'
              }`}>All</button>
          </div>
          <div className="flex gap-1 bg-white/5 rounded-xl p-1">
            <button onClick={() => setView('grid')} className={`p-1.5 rounded-lg transition-all hover-target ${view === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}><Grid3X3 className="w-4 h-4" /></button>
            <button onClick={() => setView('list')} className={`p-1.5 rounded-lg transition-all hover-target ${view === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {filtered.map(room => (
            <button key={room.id} onClick={() => setSelectedRoom(room === selectedRoom ? null : room)}
              className={`aspect-square flex flex-col items-center justify-center rounded-xl border text-xs font-bold transition-all hover-target hover:scale-105 ${
                selectedRoom?.id === room.id ? 'ring-2 ring-primary-400 scale-105' : ''
              } ${statusColors[room.status] || statusColors.available}`}>
              <BedDouble className="w-3 h-3 mb-0.5 opacity-70" />
              {room.number}
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-surface/50 border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                {['Room', 'Floor', 'Type', 'Occupancy', 'Status', 'Occupants'].map(h => (
                  <th key={h} className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(room => (
                <tr key={room.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-white font-mono font-bold">{room.number}</td>
                  <td className="py-3 px-4 text-gray-300">{room.floor}</td>
                  <td className="py-3 px-4 text-gray-300 capitalize">{room.room_type}</td>
                  <td className="py-3 px-4 text-gray-300">{room.occupant_count}/{room.capacity}</td>
                  <td className="py-3 px-4">
                    <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${statusColors[room.status] || ''}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDot[room.status] || ''}`} />{room.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400 text-sm">{room.occupants.map(o => o.full_name).join(', ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedRoom && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 w-72 bg-surface border border-white/10 rounded-2xl p-5 shadow-2xl z-40">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-xl font-bold text-white">Room {selectedRoom.number}</div>
              <div className="text-sm text-gray-400">Floor {selectedRoom.floor} · {selectedRoom.room_type}</div>
            </div>
            <button onClick={() => setSelectedRoom(null)} className="text-gray-500 hover:text-white transition-colors">✕</button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Capacity</span>
              <span className="text-white">{selectedRoom.occupant_count}/{selectedRoom.capacity}</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2">
              <div className="h-2 rounded-full bg-primary-500 transition-all"
                style={{ width: `${(selectedRoom.occupant_count / selectedRoom.capacity) * 100}%` }} />
            </div>
            {selectedRoom.occupants.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs text-gray-500 uppercase tracking-wider">Occupants</div>
                {selectedRoom.occupants.map(o => (
                  <div key={o.id} className="flex items-center gap-2 text-sm text-gray-300">
                    <User className="w-3.5 h-3.5 text-primary-400" />{o.full_name}
                  </div>
                ))}
              </div>
            )}
            {(selectedRoom.status === 'available' || selectedRoom.status === 'partial') && (
              <button className="w-full flex items-center justify-center gap-2 py-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 border border-primary-500/20 rounded-xl text-sm font-medium transition-all hover-target mt-2">
                <UserPlus className="w-4 h-4" /> Assign Student
              </button>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Allocation;
