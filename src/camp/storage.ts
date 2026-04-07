import { doc, getDoc, onSnapshot, setDoc, type DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';

const NS = 'camp2026';

const CAMP_DOC = () => doc(db, 'camp', 'state');

export type ExitEntry = {
  id: string;
  start: string;
  end: string;
  nights: number;
  createdAt: string;
};

export type CampDB = {
  passwordOk: boolean;
  entries: ExitEntry[];
  updatedAt?: string;
};

function normalize(db: CampDB): CampDB {
  return {
    passwordOk: !!db.passwordOk,
    entries: Array.isArray(db.entries) ? db.entries : [],
    updatedAt: db.updatedAt,
  };
}

function snapToCamp(snap: DocumentSnapshot): CampDB {
  const d = snap.data() as Record<string, unknown> | undefined;
  if (!d) return { passwordOk: false, entries: [] };
  return normalize({
    passwordOk: !!d.passwordOk,
    entries: (Array.isArray(d.entries) ? d.entries : []) as ExitEntry[],
    updatedAt: typeof d.updatedAt === 'string' ? d.updatedAt : undefined,
  });
}

function plainForFirestore(db: CampDB): Record<string, unknown> {
  return {
    passwordOk: db.passwordOk,
    entries: db.entries,
    updatedAt: db.updatedAt ?? new Date().toISOString(),
  };
}

export function loadLocalDB(): CampDB {
  try {
    const raw = localStorage.getItem(NS);
    if (!raw) return { passwordOk: false, entries: [] };
    const parsed = JSON.parse(raw) as CampDB;
    return normalize(parsed);
  } catch {
    return { passwordOk: false, entries: [] };
  }
}

export function saveLocalDB(dbState: CampDB) {
  try {
    localStorage.setItem(NS, JSON.stringify(dbState));
  } catch {
    // ignore
  }
}

function stamp(db: CampDB): CampDB {
  return { ...db, updatedAt: new Date().toISOString() };
}

/** If local data exists but the Firestore doc is missing, upload once */
export async function ensureCampInitialized(): Promise<void> {
  const ref = CAMP_DOC();
  const snap = await getDoc(ref);
  const local = loadLocalDB();
  if (!snap.exists() && (local.entries.length > 0 || local.passwordOk)) {
    await setDoc(ref, plainForFirestore(stamp(local)));
  }
}

/** Fires when Firestore changes (all devices) */
export function subscribeCampDB(onData: (data: CampDB) => void, onError?: (e: Error) => void): () => void {
  return onSnapshot(
    CAMP_DOC(),
    (snap) => {
      if (!snap.exists()) {
        const local = loadLocalDB();
        onData(
          local.entries.length > 0 || local.passwordOk
            ? local
            : { passwordOk: false, entries: [] }
        );
        return;
      }
      onData(snapToCamp(snap));
    },
    (err) => {
      onError?.(err as Error);
    }
  );
}

export async function pushCampDB(db: CampDB): Promise<CampDB | null> {
  const body = stamp(db);
  try {
    await setDoc(CAMP_DOC(), plainForFirestore(body));
    saveLocalDB(body);
    return body;
  } catch {
    return null;
  }
}

export function addEntry(db: CampDB, entry: ExitEntry): CampDB {
  return { ...db, entries: [...db.entries, entry] };
}

export function removeEntry(db: CampDB, id: string): CampDB {
  return { ...db, entries: db.entries.filter((e) => e.id !== id) };
}

export function replaceEntry(db: CampDB, updated: ExitEntry): CampDB {
  return { ...db, entries: db.entries.map((e) => (e.id === updated.id ? updated : e)) };
}

export function resetDB(): CampDB {
  return { passwordOk: false, entries: [] };
}

export function exportText(entries: ExitEntry[]): string {
  const sorted = [...entries].sort((a, b) => a.start.localeCompare(b.start));
  const lines: string[] = [];
  const monthTotals = new Map<string, number>();

  for (const e of sorted) {
    const s = new Date(e.start);
    const en = new Date(e.end);
    const startStr = formatDateDisplay(s);
    const endStr = formatDateDisplay(en);
    lines.push(
      `${weekdayName(s)} ${startStr} exit — ${endStr} return = ${e.nights} nights away from camp`
    );

    const key = `${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, '0')}`;
    monthTotals.set(key, (monthTotals.get(key) || 0) + e.nights);
  }

  lines.push('');
  for (let m = 0; m < 12; m++) {
    const key = `2026-${String(m + 1).padStart(2, '0')}`;
    const nights = monthTotals.get(key) || 0;
    lines.push(`${monthName(m)} 2026 nights away from camp: ${nights}`);
  }

  return lines.join('\n');
}

export function formatDateDisplay(d: Date) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function weekdayName(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'long' });
}

export function monthName(m: number) {
  return new Date(2026, m, 1).toLocaleDateString('en-US', { month: 'long' });
}

export function toISODate(y: number, m: number, d: number) {
  const dt = new Date(y, m, d);
  dt.setHours(0, 0, 0, 0);
  return dt.toISOString();
}

export function id() {
  return Math.random().toString(36).slice(2, 10);
}
