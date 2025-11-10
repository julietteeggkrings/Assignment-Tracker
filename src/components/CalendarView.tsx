import { useState } from "react";
import { useAssignments } from "@/contexts/AssignmentContext";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  parseISO,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { Assignment, AssignmentType } from "@/types/assignment";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const CalendarView = () => {
  const { assignments, updateStatus } = useAssignments();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get starting day of week for month (0 = Sunday)
  const startingDayOfWeek = monthStart.getDay();

  // Create array with empty slots for alignment
  const calendarDays = [
    ...Array(startingDayOfWeek).fill(null),
    ...daysInMonth,
  ];

  const getAssignmentsForDay = (day: Date): Assignment[] => {
    return assignments.filter(assignment =>
      isSameDay(parseISO(assignment.dueDate), day)
    );
  };

  const getTypeColor = (type: AssignmentType): string => {
    const colorMap: Record<AssignmentType, string> = {
      Homework: "bg-pastel-pink text-foreground",
      Quiz: "bg-pastel-peach text-foreground",
      Project: "bg-pastel-lavender text-foreground",
      Exam: "bg-status-overdue text-white",
      Reading: "bg-pastel-mint text-foreground",
      Coding: "bg-primary/70 text-white",
      Recitation: "bg-accent text-foreground",
      Other: "bg-muted text-foreground",
    };
    return colorMap[type] || "bg-muted text-foreground";
  };

  const dayAssignments = selectedDay ? getAssignmentsForDay(selectedDay) : [];

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-bold text-foreground">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/50">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div
              key={day}
              className="p-3 text-center text-sm font-semibold text-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="border-b border-r border-border bg-muted/20" />;
            }

            const dayAssignments = getAssignmentsForDay(day);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`min-h-32 cursor-pointer border-b border-r border-border p-2 transition-colors hover:bg-muted/30 ${
                  isCurrentDay ? "bg-primary/5" : ""
                }`}
                onClick={() => setSelectedDay(day)}
              >
                <div
                  className={`mb-2 text-sm font-medium ${
                    isCurrentDay
                      ? "flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white"
                      : "text-foreground"
                  }`}
                >
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {dayAssignments.slice(0, 3).map(assignment => (
                    <div
                      key={assignment.id}
                      className={`truncate rounded px-1.5 py-0.5 text-xs font-medium ${getTypeColor(
                        assignment.type
                      )}`}
                    >
                      {assignment.title}
                    </div>
                  ))}
                  {dayAssignments.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayAssignments.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Details Dialog */}
      <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDay && format(selectedDay, "EEEE, MMMM d, yyyy")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {dayAssignments.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                No assignments due on this day
              </p>
            ) : (
              dayAssignments.map(assignment => (
                <div
                  key={assignment.id}
                  className="space-y-3 rounded-lg border border-border bg-muted/30 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {assignment.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {assignment.className} • {assignment.type}
                      </p>
                    </div>
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-medium ${getTypeColor(
                        assignment.type
                      )}`}
                    >
                      {assignment.type}
                    </span>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Status
                    </label>
                    <Select
                      value={assignment.status}
                      onValueChange={value => updateStatus(assignment.id, value as any)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Not Started">Not Started</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Submitted">Submitted</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
