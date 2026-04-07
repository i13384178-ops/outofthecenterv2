import { useEffect, useMemo, useState } from 'react';
import { load, save } from './storage';

export function useStartDate() {
  const [start, setStart] = useState<Date>(() => {
    const saved = load<string | null>('startDate', null);
    if (saved) return new Date(saved);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  useEffect(() => {
    save('startDate', start.toISOString());
  }, [start]);

  const daysTogether = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = now.getTime() - start.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
  }, [start]);

  return { startDate: start, setStartDate: setStart, daysTogether } as const;
}
