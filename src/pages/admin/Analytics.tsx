import React, { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { analyticsService } from '../../services/api';

interface ChartItem { category?: string; status?: string; priority?: string; room_type?: string; count: number; }

/* Simple bar chart — pure CSS, no library needed */
const BarChart: React.FC<{ data: ChartItem[]; labelKey: string; color: string; title: string }> = ({ data, labelKey, color, title }) => {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="card p-5">
      <h3 className="text-[14px] font-semibold text-text-1 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((d, i) => {
          const label = (d as Record<string, unknown>)[labelKey] as string || 'Unknown';
          const pct = (d.count / max) * 100;
          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] text-text-2 capitalize">{label.replace('_', ' ')}</span>
                <span className="text-[12px] font-semibold tabular-nums text-text-1">{d.count}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-overlay">
                <div className="h-2 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${pct}%`, backgroundColor: color, animationDelay: `${i * 100}ms` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* Donut chart — pure SVG */
const DonutChart: React.FC<{ data: ChartItem[]; labelKey: string; title: string; colors: string[] }> = ({ data, labelKey, title, colors }) => {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  let cumulative = 0;

  return (
    <div className="card p-5">
      <h3 className="text-[14px] font-semibold text-text-1 mb-4">{title}</h3>
      <div className="flex items-center gap-6">
        <svg width="100" height="100" viewBox="0 0 36 36" className="shrink-0">
          {data.map((d, i) => {
            const pct = (d.count / total) * 100;
            const offset = cumulative;
            cumulative += pct;
            return (
              <circle key={i} cx="18" cy="18" r="14" fill="none"
                stroke={colors[i % colors.length]} strokeWidth="4"
                strokeDasharray={`${pct * 0.88} ${88 - pct * 0.88}`}
                strokeDashoffset={`${-offset * 0.88 + 22}`}
                strokeLinecap="round" />
            );
          })}
          <text x="18" y="19" textAnchor="middle" dominantBaseline="middle"
            className="fill-text-1 text-[8px] font-semibold">{total}</text>
        </svg>
        <div className="space-y-1.5">
          {data.map((d, i) => {
            const label = (d as Record<string, unknown>)[labelKey] as string || 'Unknown';
            return (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colors[i % colors.length] }} />
                <span className="text-[12px] text-text-2 capitalize">{label.replace('_', ' ')}</span>
                <span className="text-[12px] font-semibold text-text-1 ml-auto tabular-nums">{d.count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Analytics: React.FC = () => {
  const [data, setData] = useState<Record<string, ChartItem[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.dashboard().then(res => setData(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="space-y-6"><div className="skeleton h-10 w-48" /><div className="grid grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="skeleton h-48 rounded-xl" />)}</div></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-1.5 text-text-2 text-[11px] font-medium tracking-[0.08em] uppercase mb-2">
          <BarChart3 className="w-3.5 h-3.5" strokeWidth={1.5} /> Analytics
        </div>
        <h1 className="text-[28px] text-text-1 leading-tight">
          <span className="font-semibold">Hostel </span>
          <span className="font-[family-name:var(--font-display)] italic">analytics</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DonutChart data={data.complaints_by_category || []} labelKey="category" title="Complaints by Category"
          colors={['#6366F1', '#22C55E', '#EAB308', '#EF4444', '#60A5FA', '#A78BFA']} />
        <DonutChart data={data.complaints_by_status || []} labelKey="status" title="Complaints by Status"
          colors={['#6366F1', '#EAB308', '#22C55E']} />
        <BarChart data={data.complaints_by_priority || []} labelKey="priority" color="#6366F1" title="Complaints by Priority" />
        <DonutChart data={data.rooms_by_status || []} labelKey="status" title="Room Occupancy"
          colors={['#22C55E', '#3F3F46', '#EAB308', '#EF4444']} />
        <BarChart data={data.rooms_by_type || []} labelKey="room_type" color="#22C55E" title="Rooms by Type" />
        <DonutChart data={data.payments_by_status || []} labelKey="status" title="Payment Status"
          colors={['#22C55E', '#EF4444', '#EAB308']} />
      </div>
    </div>
  );
};

export default Analytics;
