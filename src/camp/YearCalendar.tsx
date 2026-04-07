import { useEffect, useMemo, useRef, useState } from 'react';
import { buildYear2026, computeOutsideMap, countNightsForMonth, startOfDay } from './calendar';
import {
  CampDB,
  ExitEntry,
  addEntry,
  ensureCampInitialized,
  exportText,
  id,
  loadLocalDB,
  pushCampDB,
  removeEntry,
  replaceEntry,
  saveLocalDB,
  subscribeCampDB,
} from './storage';
import { cn } from '@/utils/cn';

const PW = 'ZERO0!';

function fmtYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function dateInputValue(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function MonthCard({
  monthIndex,
  entries,
  onAddRange,
  onQuickToggle,
}: {
  monthIndex: number;
  entries: ExitEntry[];
  onAddRange: (start: Date, end: Date) => void;
  onQuickToggle: (date: Date, outside: boolean) => void;
}) {
  const cells = useMemo(() => buildYear2026()[monthIndex], [monthIndex]);
  const outsideMap = useMemo(() => computeOutsideMap(entries), [entries]);
  const usedNights = useMemo(() => countNightsForMonth(entries, 2026, monthIndex), [entries, monthIndex]);

  const monthName = new Date(2026, monthIndex, 1).toLocaleDateString('en-US', { month: 'long' });

  const [menuDay, setMenuDay] = useState<Date | null>(null);

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/60 backdrop-blur p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="capitalize font-semibold text-slate-100">{monthName} 2026</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">{usedNights}/10 nights away</span>
        </div>
        <button
          onClick={() => {
            // open range add default full month? We'll show small inline in header via prompt style
            const s = new Date(2026, monthIndex, 1); s.setHours(0,0,0,0);
            const e = new Date(2026, monthIndex, 2); e.setHours(0,0,0,0);
            onAddRange(s, e);
          }}
          className="text-xs px-2 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
        >Add range</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-slate-300 text-xs">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w) => (
          <div key={w} className="text-center py-1 text-slate-400">{w}</div>
        ))}
        {cells.map((c, idx) => {
          const inMonth = c.m === monthIndex && c.y === 2026;
          const key = fmtYMD(c.date);
          const isOutside = outsideMap.has(key);
          return (
            <button
              key={idx}
              onClick={() => setMenuDay(c.date)}
              className={cn(
                'relative h-10 rounded-md border text-center transition',
                inMonth ? 'border-slate-700 hover:border-slate-500' : 'border-slate-800 opacity-40',
                isOutside ? 'bg-rose-600/30 text-rose-300' : 'bg-slate-800/40'
              )}
              title={key}
            >
              <span className={cn('absolute top-1 left-1 w-1.5 h-1.5 rounded-full', c.isToday ? 'bg-emerald-400' : 'bg-transparent')} />
              <span className="text-sm font-medium">{c.d}</span>
            </button>
          );
        })}
      </div>

      {menuDay && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setMenuDay(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-4 text-slate-200" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">{menuDay.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h4>
              <button className="text-slate-400 hover:text-slate-200" onClick={() => setMenuDay(null)}>Close</button>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => { onQuickToggle(menuDay, true); setMenuDay(null); }}
                className="w-full rounded-lg px-3 py-2 bg-rose-600 text-white hover:bg-rose-500"
              >I did not stay at camp tonight</button>
              <button
                onClick={() => { onQuickToggle(menuDay, false); setMenuDay(null); }}
                className="w-full rounded-lg px-3 py-2 bg-emerald-600 text-white hover:bg-emerald-500"
              >I stayed at camp tonight</button>
              <div className="pt-2 border-t border-slate-700">
                <p className="text-xs text-slate-400">Note: Unless marked otherwise, you are assumed to be at camp. Only mark nights you were not at camp.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const INIT_DB = loadLocalDB();

export function YearCalendar() {
  const [db, setDb] = useState<CampDB>(() => INIT_DB);
  const [syncOk, setSyncOk] = useState(true);
  const lastPushedSerialized = useRef(JSON.stringify(INIT_DB));

  useEffect(() => {
    let unsub: (() => void) | undefined;

    const runEnsure = async () => {
      try {
        await Promise.race([
          ensureCampInitialized(),
          new Promise<never>((_, rej) => {
            window.setTimeout(() => rej(new Error('timeout')), 12_000);
          }),
        ]);
      } catch {
        setSyncOk(false);
      }
    };

    void runEnsure();

    unsub = subscribeCampDB(
      (data) => {
        lastPushedSerialized.current = JSON.stringify(data);
        setDb(data);
        setSyncOk(true);
      },
      () => {
        setSyncOk(false);
        setDb(loadLocalDB());
      }
    );

    return () => {
      unsub?.();
    };
  }, []);

  useEffect(() => {
    saveLocalDB(db);
  }, [db]);

  useEffect(() => {
    const serialized = JSON.stringify(db);
    if (serialized === lastPushedSerialized.current) return;
    const t = window.setTimeout(async () => {
      const saved = await pushCampDB(db);
      if (saved) {
        lastPushedSerialized.current = JSON.stringify(saved);
        setSyncOk(true);
        setDb(saved);
      } else {
        setSyncOk(false);
      }
    }, 450);
    return () => window.clearTimeout(t);
  }, [db]);

  const authed = !!db.passwordOk;
  const entries = db.entries;

  const addRange = (start: Date, end: Date) => {
    const s = startOfDay(start);
    const e = startOfDay(end);
    if (e <= s) {
      alert('Return date must be after the exit date');
      return;
    }
    // The nights are attributed to months by day. We must ensure each month in 2026 does not exceed 10
    // Build a map month->added nights for this new range and check against existing usage
    const temp = new Map<string, number>();
    for (let d = new Date(s); d < e; d.setDate(d.getDate()+1)) {
      const cur = new Date(d);
      if (cur.getFullYear() !== 2026) continue; // only constrain 2026 per requirement
      const key = `${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,'0')}`;
      temp.set(key, (temp.get(key)||0)+1);
    }
    // validate
    for (const [key, addN] of temp) {
      const [y, m] = key.split('-').map(Number);
      const used = countNightsForMonth(entries, y, m-1);
      if (used + addN > 10) {
        alert(`Month ${key} would exceed the limit. Adding ${addN} night(s) would make ${used + addN} total (limit 10).`);
        return;
      }
    }

    const entry: ExitEntry = {
      id: id(),
      start: s.toISOString(),
      end: e.toISOString(),
      nights: Math.max(0, Math.round((e.getTime()-s.getTime())/86400000)),
      createdAt: new Date().toISOString(),
    };
    setDb(addEntry(db, entry));
  };

  const quickToggle = (date: Date, outside: boolean) => {
    const d0 = startOfDay(date);
    // We represent a single outside night as a range [d0, d0+1)
    // First, check if an entry already covers that night; if outside=false, remove that night from any overlapping range.

    // Find overlapping entries
    const overlaps = entries.filter(e => {
      const s = startOfDay(new Date(e.start));
      const e2 = startOfDay(new Date(e.end));
      return d0 >= s && d0 < e2; // night belongs to this range
    });

    if (!outside) {
      // remove this single night from overlaps: may split range
      if (overlaps.length === 0) return; // nothing to do
      let curDb = db;
      for (const ent of overlaps) {
        const s = startOfDay(new Date(ent.start));
        const e2 = startOfDay(new Date(ent.end));
        if (d0.getTime() === s.getTime() && d0.getTime()+86400000 === e2.getTime()) {
          // exact 1-night range, delete
          curDb = removeEntry(curDb, ent.id);
        } else if (d0.getTime() === s.getTime()) {
          // trim start forward one day
          const updated: ExitEntry = { ...ent, start: new Date(s.getTime()+86400000).toISOString(), nights: ent.nights - 1 };
          curDb = replaceEntry(curDb, updated);
        } else if (d0.getTime()+86400000 === e2.getTime()) {
          // trim end backward one day
          const updated: ExitEntry = { ...ent, end: new Date(e2.getTime()-86400000).toISOString(), nights: ent.nights - 1 };
          curDb = replaceEntry(curDb, updated);
        } else {
          // split into two entries
          const left: ExitEntry = { ...ent, id: id(), end: new Date(d0.getTime()).toISOString(), nights: Math.round((d0.getTime()-s.getTime())/86400000) };
          const right: ExitEntry = { ...ent, id: id(), start: new Date(d0.getTime()+86400000).toISOString(), nights: Math.round(((e2.getTime())-(d0.getTime()+86400000))/86400000) };
          curDb = removeEntry(curDb, ent.id);
          curDb = addEntry(curDb, left);
          curDb = addEntry(curDb, right);
        }
      }
      setDb(curDb);
      return;
    }

    // outside=true: add a new single-night range, but enforce monthly limit
    if (d0.getFullYear() === 2026) {
      const used = countNightsForMonth(entries, 2026, d0.getMonth());
      if (used + 1 > 10) {
        alert(`${d0.toLocaleDateString('en-US', { month: 'long' })} is already at the limit (10 nights).`);
        return;
      }
    }
    // if already outside (overlaps>0), don't duplicate
    if (overlaps.length > 0) return;

    const entry: ExitEntry = {
      id: id(),
      start: d0.toISOString(),
      end: new Date(d0.getTime()+86400000).toISOString(),
      nights: 1,
      createdAt: new Date().toISOString(),
    };
    setDb(addEntry(db, entry));
  };

  const [showExport, setShowExport] = useState(false);
  const exportTextValue = useMemo(() => exportText(entries), [entries]);

  if (!authed) {
    return <Login onOk={() => { setDb({ ...db, passwordOk: true }); }} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">⛺</div>
            <div>
              <h1 className="text-lg font-bold">Camp Tracker 2026</h1>
              <p className="text-xs text-slate-400">
                Monthly limit: 10 nights away
                <span className={syncOk ? ' text-slate-500' : ' text-amber-400'}>
                  {syncOk ? ' · Synced' : ' · Could not write to server (local cache)'}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowExport(true)} className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600">Text export</button>
            <button onClick={() => { if (confirm('This will clear all data. Are you sure?')) setDb({ passwordOk: true, entries: [] }); }} className="text-xs px-3 py-1.5 rounded-lg bg-rose-700 text-white hover:bg-rose-600">Reset</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, m) => (
            <MonthCard
              key={m}
              monthIndex={m}
              entries={entries}
              onAddRange={(s, e) => {
                // open a modal to pick real range
                openRangeModal(s, e, addRange);
              }}
              onQuickToggle={quickToggle}
            />
          ))}
        </div>
      </main>

      {showExport && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={() => setShowExport(false)}>
          <div className="w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-2xl p-4" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Text export</h3>
              <button className="text-slate-400 hover:text-slate-200" onClick={() => setShowExport(false)}>Close</button>
            </div>
            <textarea readOnly className="w-full h-80 rounded-lg bg-slate-900 border border-slate-800 p-3 text-sm" value={exportTextValue} />
            <div className="mt-3 flex items-center gap-2">
              <button onClick={() => navigator.clipboard.writeText(exportTextValue)} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 text-sm">Copy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Login({ onOk }: { onOk: () => void }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  return (
    <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-200">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 grid place-items-center">⛺</div>
          <div>
            <h1 className="text-xl font-bold">Camp Tracker 2026</h1>
            <p className="text-xs text-slate-400">Single-user sign-in</p>
          </div>
        </div>
        <label className="block text-xs text-slate-400 mb-1">Password</label>
        <input
          type="password"
          autoFocus
          value={pw}
          onChange={(e)=>setPw(e.target.value)}
          onKeyDown={(e)=>{ if (e.key==='Enter') { if (pw === PW) onOk(); else setErr('Wrong password'); } }}
          className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 outline-none focus:border-indigo-500"
        />
        {err && <p className="mt-2 text-xs text-rose-400">{err}</p>}
        <button
          onClick={()=>{ if (pw === PW) onOk(); else setErr('Wrong password'); }}
          className="mt-4 w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white py-2 font-medium"
        >Sign in</button>
      </div>
    </div>
  );
}

function openRangeModal(defStart: Date, defEnd: Date, onConfirm: (s: Date, e: Date)=>void) {
  const root = document.createElement('div');
  document.body.appendChild(root);

  const close = () => {
    if (root.parentElement) root.parentElement.removeChild(root);
  };

  const ui = (
    <RangeModal
      start={defStart}
      end={defEnd}
      onCancel={close}
      onConfirm={(s, e)=>{ onConfirm(s, e); close(); }}
    />
  );

  // hydrate minimal react root
  // dynamic import to avoid circular with main
  import('react-dom/client').then(({ createRoot }) => {
    const r = createRoot(root);
    r.render(ui);
  });
}

function RangeModal({ start, end, onCancel, onConfirm }: { start: Date; end: Date; onCancel: ()=>void; onConfirm: (s: Date, e: Date)=>void }) {
  const [s, setS] = useState(start);
  const [e, setE] = useState(end);
  const valS = dateInputValue(s);
  const valE = dateInputValue(e);

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center" onClick={onCancel}>
      <div className="w-full max-w-md rounded-2xl bg-slate-950 border border-slate-800 p-4 text-slate-200" onClick={(ev)=>ev.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Exit / return range</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-200">Close</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Exit</label>
            <input type="date" value={valS} onChange={(ev)=>{ const [yy,mm,dd]=ev.target.value.split('-').map(Number); const nd = new Date(yy,mm-1,dd); nd.setHours(0,0,0,0); setS(nd); }} className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Return to camp</label>
            <input type="date" value={valE} onChange={(ev)=>{ const [yy,mm,dd]=ev.target.value.split('-').map(Number); const nd = new Date(yy,mm-1,dd); nd.setHours(0,0,0,0); setE(nd); }} className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2" />
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-400">Note: Nights away count the exit night through the night before the return day.</p>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">Cancel</button>
          <button onClick={()=>onConfirm(s, e)} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500">Save</button>
        </div>
      </div>
    </div>
  );
}
