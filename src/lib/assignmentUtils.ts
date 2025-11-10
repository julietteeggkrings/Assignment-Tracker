import { Assignment, AssignmentStatus } from "@/types/assignment";
import { differenceInDays, format, parseISO } from "date-fns";

export function calculateDaysUntilDue(dueDate: string): number {
  const due = parseISO(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return differenceInDays(due, today);
}

export function getDayOfWeek(dueDate: string): string {
  return format(parseISO(dueDate), "EEE");
}

export function formatDate(dueDate: string): string {
  return format(parseISO(dueDate), "MM/dd/yyyy");
}

export function getStatusColor(status: AssignmentStatus): string {
  const statusColorMap: Record<AssignmentStatus, string> = {
    "Not Started": "bg-red-500 text-white",
    "In Progress": "bg-status-in-progress text-white",
    "Submitted": "bg-status-submitted text-white",
    "Completed": "bg-status-completed text-white",
    "Overdue": "bg-status-overdue text-white",
  };
  return statusColorMap[status];
}

export function autoUpdateStatus(assignment: Assignment): AssignmentStatus {
  const daysUntil = calculateDaysUntilDue(assignment.dueDate);
  
  if (assignment.status === "Completed" || assignment.status === "Submitted") {
    return assignment.status;
  }
  
  if (daysUntil < 0) {
    return "Overdue";
  }
  
  return assignment.status;
}

export function getUrgencyColor(daysUntil: number, status: AssignmentStatus): string {
  if (status === "Completed" || status === "Submitted") return "";
  if (daysUntil < 0) return "text-status-overdue font-semibold";
  if (daysUntil <= 2) return "text-status-in-progress font-semibold";
  return "";
}
