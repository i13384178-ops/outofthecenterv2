import { useEffect, useMemo, useRef, useState } from 'react';
import { useStartDate } from './useStartDate';
import { cn } from '@/utils/cn';

export function LoveCounter() {
  const { startDate, setStartDate, daysTogether } = useStartDate();
  const [display, setDisplay] = useState(daysTogether);
  const prev = useRef(daysTogether);

  useEffect(() => {
    const from = prev.current;
    const to = daysTogether;
    if (from === to) return;
    const start = performance.now();
    const duration = 600;

    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const value = Math.round(from + (to - from) * p);
      setDisplay(value);
      if (p < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    prev.current = to;
  }, [daysTogether]);

  const startValue = useMemo(() => {
    const y = startDate.getFullYear();
    const m = String(startDate.getMonth() + 1).padStart(2, '0');
    const d = String(startDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [startDate]);

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 border border-pink-100 shadow-lg shadow-pink-200/40">
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-pink-200/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-rose-200/30 rounded-full blur-3xl" />

      <div className="relative flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-600 flex items-center justify-center shadow-md shadow-rose-300/40">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21s-6.716-4.377-9.165-8.327C1.097 10.39 1.5 7.5 3.757 5.757 6.015 4.015 8.9 4.4 10.5 6c.345.345.64.732.875 1.147.236-.415.531-.802.875-1.147 1.6-1.6 4.485-1.985 6.743-.243 2.258 1.743 2.66 4.633.922 6.916C18.716 16.623 12 21 12 21z"/>
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-rose-900">Aşk Sayacı</h3>
          <p className="text-sm text-rose-600">Beraber geçen günler</p>
        </div>
      </div>

      <div className="relative flex items-end gap-3">
        <span className="text-6xl font-black tracking-tight text-rose-700 drop-shadow-sm">{display}</span>
        <span className="pb-3 text-rose-500 font-medium">gün</span>
      </div>

      <div className="mt-5 p-3 rounded-2xl bg-white/70 backdrop-blur border border-pink-100">
        <label className="block text-xs font-semibold text-rose-500 mb-1">Başlangıç tarihi</label>
        <input
          type="date"
          value={startValue}
          onChange={(e) => {
            const val = e.target.value;
            if (!val) return;
            const [y, m, d] = val.split('-').map(Number);
            const nd = new Date(y, m - 1, d);
            nd.setHours(0, 0, 0, 0);
            setStartDate(nd);
          }}
          className={cn(
            'w-full rounded-xl border px-3 py-2 text-sm outline-none transition',
            'bg-white/80 border-rose-200 text-rose-800 focus:ring-2 focus:ring-rose-300 focus:border-rose-300'
          )}
        />
      </div>
    </div>
  );
}
