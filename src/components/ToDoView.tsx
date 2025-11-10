import { useAssignments } from "@/contexts/AssignmentContext";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/assignmentUtils";
import { Priority } from "@/types/assignment";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const ToDoView = () => {
  const { assignments, toggleComplete, updateAssignment } = useAssignments();

  const incompleteTasks = assignments
    .filter(a => a.status !== "Completed" && a.status !== "Submitted")
    .sort((a, b) => {
      // Sort by priority first (High > Medium > Low)
      const priorityOrder = { High: 0, Medium: 1, Low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      // Then by date
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const completedCount = assignments.filter(
    a => a.status === "Completed" || a.status === "Submitted"
  ).length;
  const totalCount = assignments.length;

  const today = format(new Date(), "EEEE, MMMM d, yyyy");

  const getPriorityBadge = (priority: Priority) => {
    const styles = {
      High: "bg-status-overdue text-white",
      Medium: "bg-status-in-progress text-white",
      Low: "bg-primary/70 text-white",
    };
    return styles[priority];
  };

  const handlePriorityChange = (id: string, priority: Priority) => {
    updateAssignment(id, { priority });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="rounded-lg bg-pastel-cream p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">To-Do List</h2>
            <p className="mt-1 text-sm text-muted-foreground">Today is: {today}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-4xl font-bold text-primary">{completedCount}</span>
            <span className="text-2xl text-muted-foreground">/</span>
            <span className="text-4xl font-bold text-foreground">{totalCount}</span>
            <span className="ml-2 text-sm text-muted-foreground">Completed</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-end">
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Tasks Table */}
      <div className="overflow-x-auto rounded-lg border border-border shadow-sm">
        <table className="w-full border-collapse bg-card">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                Done
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                Priority
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                Class
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                Task
              </th>
            </tr>
          </thead>
          <tbody>
            {incompleteTasks.map(task => (
              <tr
                key={task.id}
                className="border-b border-border transition-colors hover:bg-muted/30"
              >
                <td className="px-4 py-3 text-center">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleComplete(task.id)}
                    className="mx-auto"
                  />
                </td>
                <td className="px-4 py-3">
                  <Select
                    value={task.priority}
                    onValueChange={(value: Priority) =>
                      handlePriorityChange(task.id, value)
                    }
                  >
                    <SelectTrigger
                      className={`w-28 text-xs font-medium ${getPriorityBadge(
                        task.priority
                      )}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3 text-sm">{formatDate(task.dueDate)}</td>
                <td className="px-4 py-3">
                  <span className="inline-block rounded-md bg-pastel-lavender px-2 py-1 text-xs font-medium">
                    {task.className}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-medium">{task.title}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {incompleteTasks.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">
            No pending tasks! Great job! 🎉
          </p>
        </div>
      )}
    </div>
  );
};
