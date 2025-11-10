import { useAssignments } from "@/contexts/AssignmentContext";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/assignmentUtils";
import { getContrastColor } from "@/lib/colorUtils";
import { getToDoPriorityColor } from "@/lib/toDoUtils";
import { ToDoPriority } from "@/types/assignment";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ExportDropdown } from "@/components/ExportDropdown";
import { exportToDoToCSV, exportToDoToExcel, copyToClipboard } from "@/lib/exportUtils";
import { toast } from "@/hooks/use-toast";

export const ToDoView = () => {
  const { assignments, classes, toggleToDoComplete, updateToDoPriority, toggleToDoStatus } = useAssignments();

  // Only show assignments that are added to To-Do list
  const toDoTasks = assignments
    .filter(a => a.addedToToDo)
    .sort((a, b) => {
      // Sort by priority first (High > Low)
      const priorityOrder = { High: 0, Low: 1 };
      if (priorityOrder[a.toDoPriority] !== priorityOrder[b.toDoPriority]) {
        return priorityOrder[a.toDoPriority] - priorityOrder[b.toDoPriority];
      }
      // Then by date
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const toDoCompletedCount = toDoTasks.filter(a => a.toDoCompleted).length;
  const totalToDoCount = toDoTasks.length;

  const today = format(new Date(), "EEEE, MMMM d, yyyy");

  const handlePriorityChange = (id: string, priority: ToDoPriority) => {
    updateToDoPriority(id, priority);
  };

  const handleExportCSV = () => {
    exportToDoToCSV(toDoTasks);
    toast({ title: "Success", description: `Exported ${toDoTasks.length} tasks to CSV` });
  };

  const handleExportExcel = async () => {
    await exportToDoToExcel(toDoTasks);
    toast({ title: "Success", description: `Exported ${toDoTasks.length} tasks to Excel` });
  };

  const handleCopyClipboard = async () => {
    await copyToClipboard(toDoTasks);
    toast({ title: "Success", description: "Copied to clipboard" });
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
            <div className="flex items-center gap-4">
              <ExportDropdown
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onCopyClipboard={handleCopyClipboard}
              />
              <div className="flex items-center gap-2">
                <span className="text-4xl font-bold text-black dark:text-white">{toDoCompletedCount}</span>
                <span className="text-2xl text-muted-foreground">/</span>
                <span className="text-4xl font-bold text-black dark:text-white">{totalToDoCount}</span>
                <span className="ml-2 text-sm text-muted-foreground">Completed</span>
              </div>
            </div>
        </div>
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
              <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                Remove
              </th>
            </tr>
          </thead>
          <tbody>
            {toDoTasks.map(task => {
              const taskClass = classes.find(c => c.courseCode === task.classId);
              const classColor = taskClass?.color || "#E5DEFF";
              
              return (
              <tr
                key={task.id}
                className={`border-b border-border transition-colors hover:bg-muted/30 ${
                  task.toDoCompleted ? "bg-muted/50 opacity-60" : ""
                }`}
              >
                <td className="px-4 py-3 text-center">
                  <Checkbox
                    checked={task.toDoCompleted}
                    onCheckedChange={() => toggleToDoComplete(task.id)}
                    className="mx-auto"
                  />
                </td>
                <td className="px-4 py-3">
                  <Select
                    value={task.toDoPriority}
                    onValueChange={(value: ToDoPriority) =>
                      handlePriorityChange(task.id, value)
                    }
                  >
                    <SelectTrigger
                      className={`w-24 text-xs font-medium ${getToDoPriorityColor(
                        task.toDoPriority
                      )}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className={`px-4 py-3 text-sm ${task.toDoCompleted ? "line-through" : ""}`}>
                  {formatDate(task.dueDate)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-md px-2 py-1 text-xs font-medium ${
                      task.toDoCompleted ? "line-through" : ""
                    }`}
                    style={{
                      backgroundColor: classColor,
                      color: getContrastColor(classColor)
                    }}
                  >
                    {task.className}
                  </span>
                </td>
                <td className={`px-4 py-3 text-sm font-medium ${task.toDoCompleted ? "line-through" : ""}`}>
                  {task.title}
                </td>
                <td className="px-4 py-3 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleToDoStatus(task.id)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>

      {toDoTasks.length === 0 && (
        <div className="rounded-lg border border-border bg-card py-12 text-center">
          <p className="text-lg text-muted-foreground">
            No tasks in your To-Do list yet.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Go to Masterlist and check the 📌 To-Do box to add assignments here!
          </p>
        </div>
      )}
    </div>
  );
};
