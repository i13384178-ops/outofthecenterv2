import { useEffect, useMemo, useState } from 'react';
import { load, save } from './storage';
import { cn } from '@/utils/cn';

type Entry = { note: string; song: string };

function fmtKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function DailySongNote() {
  const [date, setDate] = useState<Date>(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  });

  const key = useMemo(() => `notes:${fmtKey(date)}`, [date]);
  const [entry, setEntry] = useState<Entry>(() => load<Entry>(key, { note: '', song: '' }));

  useEffect(() => {
    setEntry(load<Entry>(key, { note: '', song: '' }));
  }, [key]);

  useEffect(() => {
    save<Entry>(key, entry);
  }, [key, entry]);

  const dateValue = useMemo(() => fmtKey(date), [date]);

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-fuchsia-50 via-violet-50 to-indigo-50 border border-violet-100 shadow-lg shadow-violet-200/40">
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-fuchsia-200/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-violet-200/30 rounded-full blur-3xl" />

      <div className="relative flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center shadow-md shadow-fuchsia-300/40">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-violet-900">Günlük Şarkı & Not</h3>
          <p className="text-sm text-violet-600">Bugünün melodisi ve hislerin</p>
        </div>
      </div>

      <div className="relative grid grid-cols-1 gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-violet-600">Tarih</label>
          <input
            type="date"
            value={dateValue}
            onChange={(e) => {
              const [y, m, d] = e.target.value.split('-').map(Number);
              const nd = new Date(y, m - 1, d);
              nd.setHours(0, 0, 0, 0);
              setDate(nd);
            }}
            className="rounded-xl border px-3 py-2 text-sm bg-white/80 border-violet-200 text-violet-800 focus:ring-2 focus:ring-violet-300 focus:border-violet-300 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-violet-600 mb-1">Şarkı bağlantısı (YouTube/Spotify vs.)</label>
          <input
            type="url"
            placeholder="https://..."
            value={entry.song}
            onChange={(e) => setEntry(v => ({ ...v, song: e.target.value }))}
            className="w-full rounded-xl border px-3 py-2 text-sm bg-white/80 border-violet-200 text-violet-800 focus:ring-2 focus:ring-violet-300 focus:border-violet-300 outline-none"
          />
          {entry.song && (
            <a
              href={entry.song}
              target="_blank"
              rel="noreferrer"
              className={cn(
                'inline-flex items-center gap-2 mt-2 text-xs font-medium px-3 py-1.5 rounded-lg',
                'bg-violet-600 text-white hover:bg-violet-700 transition'
              )}
            >
              Dinle
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M7 7h10v10" />
              </svg>
            </a>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-violet-600 mb-1">Bugün için küçük bir not</label>
          <textarea
            rows={4}
            placeholder="Bugün seni şöyle hissettirdi..."
            value={entry.note}
            onChange={(e) => setEntry(v => ({ ...v, note: e.target.value }))}
            className="w-full rounded-xl border px-3 py-2 text-sm bg-white/80 border-violet-200 text-violet-800 focus:ring-2 focus:ring-violet-300 focus:border-violet-300 outline-none resize-y"
          />
        </div>
      </div>
    </div>
  );
}
