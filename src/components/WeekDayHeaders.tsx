import { cn } from '@/utils/cn';

interface WeekDayHeadersProps {
  variant?: 'default' | 'dark' | 'colorful' | 'minimal';
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function WeekDayHeaders({ variant = 'default' }: WeekDayHeadersProps) {
  const styles = {
    default: 'text-slate-400',
    dark: 'text-slate-500',
    colorful: 'text-violet-400',
    minimal: 'text-slate-400',
  };

  return (
    <div className="grid grid-cols-7 mb-1">
      {WEEKDAYS.map(day => (
        <div
          key={day}
          className={cn(
            'text-center text-xs font-semibold py-2 uppercase tracking-wider',
            styles[variant]
          )}
        >
          {day}
        </div>
      ))}
    </div>
  );
}
