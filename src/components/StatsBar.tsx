import { Assignment } from "@/types/assignment";

interface StatsBarProps {
  assignments: Assignment[];
}

export const StatsBar = ({ assignments }: StatsBarProps) => {
  const total = assignments.length;
  const completed = assignments.filter(a => a.status === "Completed" || a.status === "Submitted").length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="flex flex-wrap items-center gap-6 rounded-lg bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Total:</span>
        <span className="text-2xl font-bold text-foreground">{total}</span>
      </div>
      <div className="h-8 w-px bg-border" />
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Completed:</span>
        <span className="text-2xl font-bold text-status-completed">{completed}</span>
      </div>
      <div className="h-8 w-px bg-border" />
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Progress:</span>
        <span className="text-2xl font-bold text-primary">{percentage}%</span>
      </div>
    </div>
  );
};
