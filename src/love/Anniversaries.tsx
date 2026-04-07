import { useMemo } from 'react';
import { useStartDate } from './useStartDate';

function daysBetween(a: Date, b: Date) {
  const d1 = new Date(a); d1.setHours(0,0,0,0);
  const d2 = new Date(b); d2.setHours(0,0,0,0);
  return Math.round((d2.getTime() - d1.getTime()) / (1000*60*60*24));
}

export function Anniversaries() {
  const { startDate, daysTogether } = useStartDate();

  const { nextMonthiversary, daysToMonth, nextYeariversary, daysToYear } = useMemo(() => {
    const now = new Date(); now.setHours(0,0,0,0);

    // Next monthiversary
    const monthsSince = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
    const targetMonthCount = monthsSince + 1;
    const mYear = startDate.getFullYear() + Math.floor((startDate.getMonth() + targetMonthCount) / 12);
    const mMonth = (startDate.getMonth() + targetMonthCount) % 12;
    const monthTarget = new Date(mYear, mMonth, startDate.getDate());
    const daysToM = Math.max(0, daysBetween(now, monthTarget));

    // Next yearly anniversary
    const yTargetYear = now.getMonth() > startDate.getMonth() || (now.getMonth() === startDate.getMonth() && now.getDate() >= startDate.getDate())
      ? now.getFullYear() + 1
      : now.getFullYear();
    const yearTarget = new Date(yTargetYear, startDate.getMonth(), startDate.getDate());
    const daysToY = Math.max(0, daysBetween(now, yearTarget));

    return {
      nextMonthiversary: monthTarget,
      daysToMonth: daysToM,
      nextYeariversary: yearTarget,
      daysToYear: daysToY,
    };
  }, [startDate]);

  const fmt = (d: Date) => d.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-100 shadow-lg shadow-emerald-200/40">
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-200/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-cyan-200/30 rounded-full blur-3xl" />

      <div className="relative flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-300/40">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.09 6.26L21 9.27l-5 3.64L17.18 21 12 17.77 6.82 21 8 12.91l-5-3.64 6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-emerald-900">Yıldönümleri</h3>
          <p className="text-sm text-emerald-600">Sıradaki kutlamalar</p>
        </div>
      </div>

      <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl p-4 bg-white/80 backdrop-blur border border-emerald-100">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-emerald-800">Ay dönümü</h4>
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">{daysToMonth} gün</span>
          </div>
          <p className="text-sm text-emerald-700">Tarih: {fmt(nextMonthiversary)}</p>
        </div>
        <div className="rounded-2xl p-4 bg-white/80 backdrop-blur border border-emerald-100">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-emerald-800">Yıl dönümü</h4>
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">{daysToYear} gün</span>
          </div>
          <p className="text-sm text-emerald-700">Tarih: {fmt(nextYeariversary)}</p>
        </div>
      </div>

      <p className="mt-4 text-sm text-emerald-700">Bugün itibarıyla birlikte {daysTogether} gün 🎉</p>
    </div>
  );
}
