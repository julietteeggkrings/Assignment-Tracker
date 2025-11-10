import { Assignment, AssignmentStatus, AssignmentType } from "@/types/assignment";
import { calculateDaysUntilDue, getDayOfWeek, formatDate, getStatusColor, getUrgencyColor } from "@/lib/assignmentUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface AssignmentTableProps {
  assignments: Assignment[];
  onUpdateStatus: (id: string, status: AssignmentStatus) => void;
  onToggleComplete: (id: string) => void;
  onToggleToDoStatus: (id: string) => void;
}

export const AssignmentTable = ({ assignments, onUpdateStatus, onToggleComplete, onToggleToDoStatus }: AssignmentTableProps) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-border shadow-sm">
      <table className="w-full border-collapse bg-card">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="sticky top-0 px-4 py-3 text-center text-sm font-semibold text-foreground">📌 To-Do</th>
            <th className="sticky top-0 px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
            <th className="sticky top-0 px-4 py-3 text-left text-sm font-semibold text-foreground">Day</th>
            <th className="sticky top-0 px-4 py-3 text-left text-sm font-semibold text-foreground">Due Date</th>
            <th className="sticky top-0 px-4 py-3 text-left text-sm font-semibold text-foreground">Class</th>
            <th className="sticky top-0 px-4 py-3 text-left text-sm font-semibold text-foreground">Type</th>
            <th className="sticky top-0 px-4 py-3 text-left text-sm font-semibold text-foreground">Title</th>
            <th className="sticky top-0 px-4 py-3 text-center text-sm font-semibold text-foreground">Days Until</th>
            <th className="sticky top-0 px-4 py-3 text-center text-sm font-semibold text-foreground">Done</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment) => {
            const daysUntil = calculateDaysUntilDue(assignment.dueDate);
            const urgencyClass = getUrgencyColor(daysUntil, assignment.status);
            
            return (
              <tr 
                key={assignment.id} 
                className="border-b border-border transition-colors hover:bg-muted/30"
              >
                <td className="px-4 py-3 text-center">
                  <Checkbox 
                    checked={assignment.addedToToDo}
                    onCheckedChange={() => onToggleToDoStatus(assignment.id)}
                    className="mx-auto data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </td>
                <td className="px-4 py-3">
                  <Select 
                    value={assignment.status} 
                    onValueChange={(value) => onUpdateStatus(assignment.id, value as AssignmentStatus)}
                  >
                    <SelectTrigger className={`w-36 text-xs font-medium ${getStatusColor(assignment.status)}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Submitted">Submitted</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3 text-sm">{getDayOfWeek(assignment.dueDate)}</td>
                <td className="px-4 py-3 text-sm">{formatDate(assignment.dueDate)}</td>
                <td className="px-4 py-3">
                  <span className="inline-block rounded-md bg-pastel-lavender px-2 py-1 text-xs font-medium">
                    {assignment.className}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{assignment.type}</td>
                <td className="px-4 py-3 text-sm font-medium">{assignment.title}</td>
                <td className={`px-4 py-3 text-center text-sm ${urgencyClass}`}>
                  {daysUntil}
                </td>
                <td className="px-4 py-3 text-center">
                  <Checkbox 
                    checked={assignment.completed}
                    onCheckedChange={() => onToggleComplete(assignment.id)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
