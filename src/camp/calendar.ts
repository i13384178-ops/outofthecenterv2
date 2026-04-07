import { ExitEntry } from './storage';

export type DayCell = {
  date: Date; // 00:00
  y: number;
  m: number; // 0-11
  d: number; // 1-31
  is2026: boolean;
  isToday: boolean;
  outside: boolean; // marked outside overnight
};

export function startOfDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
export function daysDiff(a: Date, b: Date) { return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86400000); }

// Build all days for 2026 displayed in 12 months (each month grid made of weeks starting Sunday)
export function buildYear2026() {
  const months: DayCell[][] = [];
  for (let m = 0; m < 12; m++) {
    const first = new Date(2026, m, 1);
    const last = new Date(2026, m + 1, 0);
    const start = new Date(first);
    // Align to Sunday
    start.setDate(first.getDate() - first.getDay());
    const end = new Date(last);
    end.setDate(last.getDate() + (6 - last.getDay()));

    const cells: DayCell[] = [];
    const today = startOfDay(new Date());
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const cur = new Date(d);
      cur.setHours(0,0,0,0);
      cells.push({
        date: cur,
        y: cur.getFullYear(),
        m: cur.getMonth(),
        d: cur.getDate(),
        is2026: cur.getFullYear() === 2026,
        isToday: cur.getTime() === today.getTime(),
        outside: false,
      });
    }
    months.push(cells);
  }
  return months; // array of months, each month is flat list of cells in full weeks
}

export function countNightsForMonth(entries: ExitEntry[], y: number, m: number): number {
  // nights counted when you sleep away: for each night between start (exit night) inclusive and end (return day) exclusive
  let nights = 0;
  for (const e of entries) {
    const s = startOfDay(new Date(e.start));
    const re = startOfDay(new Date(e.end));
    // iterate days adding nights between s (night of s) and re (night before re)
    for (let d = new Date(s); d < re; d.setDate(d.getDate() + 1)) {
      const cur = new Date(d);
      if (cur.getFullYear() === y && cur.getMonth() === m) nights += 1;
    }
  }
  return nights;
}

export function computeOutsideMap(entries: ExitEntry[]): Set<string> {
  const set = new Set<string>(); // key yyyy-mm-dd
  for (const e of entries) {
    const s = startOfDay(new Date(e.start));
    const re = startOfDay(new Date(e.end));
    for (let d = new Date(s); d < re; d.setDate(d.getDate() + 1)) {
      const cur = new Date(d);
      const key = `${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,'0')}-${String(cur.getDate()).padStart(2,'0')}`;
      set.add(key);
    }
  }
  return set;
}

export function calcNights(start: Date, end: Date) {
  // nights between start (inclusive) and end (exclusive)
  const s = startOfDay(start);
  const e = startOfDay(end);
  return Math.max(0, daysDiff(s, e));
}

export function monthlyLimitExceeded(entries: ExitEntry[], y: number, m: number, addNights: number) {
  const used = countNightsForMonth(entries, y, m);
  return used + addNights > 10;
}
