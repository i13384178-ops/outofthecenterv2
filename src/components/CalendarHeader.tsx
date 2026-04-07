import { cn } from '@/utils/cn';

interface CalendarHeaderProps {
  monthLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onToday?: () => void;
  variant?: 'default' | 'dark' | 'colorful' | 'minimal';
}

export function CalendarHeader({
  monthLabel,
  onPrev,
  onNext,
  onToday,
  variant = 'default',
}: CalendarHeaderProps) {
  const btnStyles = {
    default:
      'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200',
    dark: 'text-slate-300 hover:bg-slate-600 hover:text-white border border-slate-600',
    colorful:
      'text-violet-600 hover:bg-violet-100 hover:text-violet-800 border border-violet-200',
    minimal:
      'text-slate-500 hover:bg-slate-50 hover:text-slate-700',
  };

  const labelStyles = {
    default: 'text-slate-900',
    dark: 'text-white',
    colorful: 'text-violet-900',
    minimal: 'text-slate-700',
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={onPrev}
        className={cn(
          'flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 cursor-pointer',
          btnStyles[variant]
        )}
        aria-label="Previous month"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="flex items-center gap-2">
        <h2 className={cn('text-lg font-semibold tracking-tight', labelStyles[variant])}>
          {monthLabel}
        </h2>
        {onToday && (
          <button
            onClick={onToday}
            className={cn(
              'text-xs px-2 py-1 rounded-md transition-all duration-200 font-medium cursor-pointer',
              btnStyles[variant]
            )}
          >
            Today
          </button>
        )}
      </div>

      <button
        onClick={onNext}
        className={cn(
          'flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 cursor-pointer',
          btnStyles[variant]
        )}
        aria-label="Next month"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
