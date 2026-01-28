import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'accent';
}

const variantStyles = {
  default: 'before:bg-primary',
  success: 'before:bg-success',
  warning: 'before:bg-warning',
  accent: 'before:bg-accent',
};

export const MetricCard = ({ title, value, icon: Icon, trend, variant = 'default' }: MetricCardProps) => {
  return (
    <div className={cn('metric-card', variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold mt-2 font-display">{value}</p>
          {trend && (
            <p
              className={cn(
                'text-xs mt-2 font-medium',
                trend.positive ? 'text-success' : 'text-destructive'
              )}
            >
              {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className="p-3 bg-muted rounded-lg">
          <Icon className="w-6 h-6 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
};
