import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCompact, formatNumber } from '@/lib/format';

export default function StatTile({
  label,
  value,
  icon: Icon,
  loading,
  compact = false,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  loading: boolean;
  compact?: boolean;
}) {
  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div
            className="text-2xl font-bold text-slate-900"
            title={compact ? formatNumber(value) : undefined}
          >
            {compact ? formatCompact(value) : formatNumber(value)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
