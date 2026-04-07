import { useState, useCallback, useMemo } from 'react';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isDisabled: boolean;
  isWeekend: boolean;
  dayOfMonth: number;
}

export function useCalendar(
  disabledDates?: Date[],
  minDate?: Date,
  maxDate?: Date
) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const goToPrevMonth = useCallback(() => {
    setCurrentMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  }, []);

  const goToToday = useCallback(() => {
    setCurrentMonth(new Date());
  }, []);

  const goToMonth = useCallback((month: number, year: number) => {
    const d = new Date(year, month, 1);
    setCurrentMonth(d);
  }, []);

  const isSameDay = useCallback((a: Date, b: Date) => {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }, []);

  const isDateDisabled = useCallback(
    (date: Date) => {
      if (disabledDates?.some(d => isSameDay(d, date))) return true;
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      return false;
    },
    [disabledDates, minDate, maxDate, isSameDay]
  );

  const calendarDays = useMemo((): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDay = firstDayOfMonth.getDay(); // 0 = Sunday
    const totalDays = lastDayOfMonth.getDate();

    const days: CalendarDay[] = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      date.setHours(0, 0, 0, 0);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        isDisabled: isDateDisabled(date),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        dayOfMonth: prevMonthLastDay - i,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      date.setHours(0, 0, 0, 0);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        isDisabled: isDateDisabled(date),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        dayOfMonth: i,
      });
    }

    // Next month days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      date.setHours(0, 0, 0, 0);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        isDisabled: isDateDisabled(date),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        dayOfMonth: i,
      });
    }

    return days;
  }, [currentMonth, today, isSameDay, isDateDisabled]);

  const monthLabel = useMemo(() => {
    return currentMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }, [currentMonth]);

  return {
    currentMonth,
    calendarDays,
    monthLabel,
    today,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    goToMonth,
    isSameDay,
  };
}
