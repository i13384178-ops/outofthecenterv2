import { useState, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { useCalendar, type CalendarDay } from '@/hooks/useCalendar';
import { CalendarHeader } from './CalendarHeader';
import { WeekDayHeaders } from './WeekDayHeaders';

interface RangeDatePickerProps {
  disabledDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
  title?: string;
  subtitle?: string;
}

export function RangeDatePicker({
  disabledDates,
  minDate,
  maxDate,
  title,
  subtitle,
}: RangeDatePickerProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  const {
    calendarDays,
    monthLabel,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    isSameDay,
  } = useCalendar(disabledDates, minDate, maxDate);

  const handleSelect = useCallback(
    (day: CalendarDay) => {
      if (day.isDisabled) return;

      if (!startDate || (startDate && endDate)) {
        setStartDate(day.date);
        setEndDate(null);
      } else {
        if (day.date < startDate) {
          setStartDate(day.date);
          setEndDate(startDate);
        } else if (isSameDay(day.date, startDate)) {
          setStartDate(null);
          setEndDate(null);
        } else {
          setEndDate(day.date);
        }
      }
    },
    [startDate, endDate, isSameDay]
  );

  const isInRange = (day: CalendarDay) => {
    if (!startDate) return false;
    const end = endDate || hoveredDate;
    if (!end) return false;

    const rangeStart = startDate < end ? startDate : end;
    const rangeEnd = startDate < end ? end : startDate;

    return day.date > rangeStart && day.date < rangeEnd;
  };

  const isRangeStart = (day: CalendarDay) =>
    startDate ? isSameDay(startDate, day.date) : false;

  const isRangeEnd = (day: CalendarDay) => {
    const end = endDate || (startDate && hoveredDate && hoveredDate > startDate ? hoveredDate : null);
    return end ? isSameDay(end, day.date) : false;
  };

  const getDayStyles = (day: CalendarDay) => {
    const base = 'relative flex items-center justify-center w-10 h-10 text-sm font-medium transition-all duration-150 cursor-pointer';

    if (day.isDisabled) {
      return cn(base, 'text-slate-300 cursor-not-allowed line-through rounded-xl');
    }

    if (isRangeStart(day) && (endDate || (hoveredDate && hoveredDate > startDate!))) {
      return cn(base, 'bg-emerald-500 text-white rounded-l-xl font-bold shadow-md shadow-emerald-300/40');
    }

    if (isRangeEnd(day)) {
      return cn(base, 'bg-emerald-500 text-white rounded-r-xl font-bold shadow-md shadow-emerald-300/40');
    }

    if (isRangeStart(day)) {
      return cn(base, 'bg-emerald-500 text-white rounded-xl font-bold shadow-md shadow-emerald-300/40');
    }

    if (isInRange(day)) {
      return cn(base, 'bg-emerald-100 text-emerald-800');
    }

    if (day.isToday) {
      return cn(base, 'bg-emerald-50 text-emerald-700 font-bold ring-2 ring-emerald-200 rounded-xl');
    }

    if (!day.isCurrentMonth) {
      return cn(base, 'text-slate-300 hover:text-slate-400 hover:bg-slate-50 rounded-xl');
    }

    if (day.isWeekend) {
      return cn(base, 'text-rose-400 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl');
    }

    return cn(base, 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl');
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="flex flex-col">
      {(title || subtitle) && (
        <div className="mb-3">
          {title && (
            <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      )}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-lg shadow-slate-200/50 w-[340px]">
        <CalendarHeader
          monthLabel={monthLabel}
          onPrev={goToPrevMonth}
          onNext={goToNextMonth}
          onToday={goToToday}
        />
        <WeekDayHeaders />
        <div className="grid grid-cols-7 gap-y-1">
          {calendarDays.map((day, i) => (
            <div key={i} className="flex items-center justify-center">
              <button
                onClick={() => handleSelect(day)}
                onMouseEnter={() => !day.isDisabled && setHoveredDate(day.date)}
                onMouseLeave={() => setHoveredDate(null)}
                disabled={day.isDisabled}
                className={getDayStyles(day)}
              >
                {day.dayOfMonth}
                {day.isToday && !isRangeStart(day) && !isRangeEnd(day) && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200">
          {startDate && endDate ? (
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-slate-700">{formatDate(startDate)}</span>
              </div>
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-slate-700">{formatDate(endDate)}</span>
              </div>
              <span className="ml-auto text-xs text-slate-400">
                {Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
              </span>
            </div>
          ) : startDate ? (
            <p className="text-sm text-slate-500">
              <span className="font-medium text-slate-700">{formatDate(startDate)}</span>
              {' '}&mdash; Select end date
            </p>
          ) : (
            <p className="text-sm text-slate-400">Select a start date</p>
          )}
        </div>
      </div>
    </div>
  );
}
