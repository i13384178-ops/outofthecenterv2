import { useState, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { useCalendar, type CalendarDay } from '@/hooks/useCalendar';
import { CalendarHeader } from './CalendarHeader';
import { WeekDayHeaders } from './WeekDayHeaders';

interface SingleDatePickerProps {
  disabledDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
  variant?: 'default' | 'dark' | 'colorful' | 'minimal';
  title?: string;
  subtitle?: string;
}

export function SingleDatePicker({
  disabledDates,
  minDate,
  maxDate,
  variant = 'default',
  title,
  subtitle,
}: SingleDatePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
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
      setSelectedDate(prev =>
        prev && isSameDay(prev, day.date) ? null : day.date
      );
    },
    [isSameDay]
  );

  const isSelected = (day: CalendarDay) =>
    selectedDate ? isSameDay(selectedDate, day.date) : false;

  const containerStyles = {
    default: 'bg-white border border-slate-200 shadow-lg shadow-slate-200/50',
    dark: 'bg-slate-800 border border-slate-700 shadow-lg shadow-slate-900/50',
    colorful: 'bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-200 shadow-lg shadow-violet-200/50',
    minimal: 'bg-white border border-slate-100 shadow-sm',
  };

  const getDayStyles = (day: CalendarDay) => {
    const base = 'relative flex items-center justify-center w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer';

    if (day.isDisabled) {
      return cn(base, {
        'text-slate-300 cursor-not-allowed line-through': variant === 'default' || variant === 'minimal',
        'text-slate-600 cursor-not-allowed line-through': variant === 'dark',
        'text-violet-300 cursor-not-allowed line-through': variant === 'colorful',
      });
    }

    if (isSelected(day)) {
      return cn(base, {
        'bg-slate-900 text-white shadow-md shadow-slate-400/30 scale-105': variant === 'default',
        'bg-indigo-500 text-white shadow-md shadow-indigo-500/30 scale-105': variant === 'dark',
        'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md shadow-violet-400/40 scale-105': variant === 'colorful',
        'bg-slate-800 text-white scale-105': variant === 'minimal',
      });
    }

    if (day.isToday) {
      return cn(base, {
        'bg-blue-50 text-blue-600 font-bold ring-2 ring-blue-200': variant === 'default',
        'bg-indigo-900/50 text-indigo-300 font-bold ring-2 ring-indigo-500/50': variant === 'dark',
        'bg-violet-100 text-violet-700 font-bold ring-2 ring-violet-300': variant === 'colorful',
        'text-slate-900 font-bold underline underline-offset-4 decoration-2 decoration-slate-900': variant === 'minimal',
      });
    }

    if (!day.isCurrentMonth) {
      return cn(base, {
        'text-slate-300 hover:text-slate-500 hover:bg-slate-50': variant === 'default',
        'text-slate-600 hover:text-slate-400 hover:bg-slate-700': variant === 'dark',
        'text-violet-300 hover:text-violet-500 hover:bg-violet-100/50': variant === 'colorful',
        'text-slate-300 hover:text-slate-400': variant === 'minimal',
      });
    }

    if (day.isWeekend) {
      return cn(base, {
        'text-rose-400 hover:bg-rose-50 hover:text-rose-600': variant === 'default',
        'text-rose-400 hover:bg-slate-700 hover:text-rose-300': variant === 'dark',
        'text-pink-400 hover:bg-pink-100/50 hover:text-pink-600': variant === 'colorful',
        'text-slate-400 hover:bg-slate-50': variant === 'minimal',
      });
    }

    return cn(base, {
      'text-slate-700 hover:bg-slate-100 hover:text-slate-900': variant === 'default',
      'text-slate-300 hover:bg-slate-700 hover:text-white': variant === 'dark',
      'text-violet-800 hover:bg-violet-100 hover:text-violet-900': variant === 'colorful',
      'text-slate-600 hover:bg-slate-50 hover:text-slate-900': variant === 'minimal',
    });
  };

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
      <div className={cn('rounded-2xl p-5 w-[340px]', containerStyles[variant])}>
        <CalendarHeader
          monthLabel={monthLabel}
          onPrev={goToPrevMonth}
          onNext={goToNextMonth}
          onToday={goToToday}
          variant={variant}
        />
        <WeekDayHeaders variant={variant} />
        <div className="grid grid-cols-7 gap-y-1">
          {calendarDays.map((day, i) => (
            <div key={i} className="flex items-center justify-center">
              <button
                onClick={() => handleSelect(day)}
                disabled={day.isDisabled}
                className={getDayStyles(day)}
              >
                {day.dayOfMonth}
                {day.isToday && !isSelected(day) && variant !== 'minimal' && (
                  <span className={cn(
                    'absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full',
                    {
                      'bg-blue-500': variant === 'default',
                      'bg-indigo-400': variant === 'dark',
                      'bg-violet-500': variant === 'colorful',
                    }
                  )} />
                )}
              </button>
            </div>
          ))}
        </div>

        {selectedDate && (
          <div className={cn('mt-4 pt-3 border-t text-sm', {
            'border-slate-200 text-slate-600': variant === 'default' || variant === 'minimal',
            'border-slate-700 text-slate-400': variant === 'dark',
            'border-violet-200 text-violet-600': variant === 'colorful',
          })}>
            <span className="font-medium">Selected:</span>{' '}
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        )}
      </div>
    </div>
  );
}
