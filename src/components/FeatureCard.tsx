import { cn } from '@/utils/cn';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

export function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-100">
      <div className={cn('flex items-center justify-center w-10 h-10 rounded-lg shrink-0', color)}>
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
