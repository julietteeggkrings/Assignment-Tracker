import { useState, useEffect } from "react";
import { Assignment, AssignmentStatus } from "@/types/assignment";
import { AssignmentTable } from "@/components/AssignmentTable";
import { AddAssignmentDialog } from "@/components/AddAssignmentDialog";
import { StatsBar } from "@/components/StatsBar";
import { autoUpdateStatus } from "@/lib/assignmentUtils";
import { BookOpen, Calendar, CheckSquare, LayoutList } from "lucide-react";

const Index = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: "1",
      classId: "cse262",
      className: "CSE 262",
      title: "Quiz 5",
      type: "Quiz",
      dueDate: "2025-11-05",
      status: "Not Started",
      priority: "High",
      completed: false,
    },
    {
      id: "2",
      classId: "cse241",
      className: "CSE 241",
      title: "Homework 1",
      type: "Homework",
      dueDate: "2025-11-07",
      status: "In Progress",
      priority: "Medium",
      completed: false,
    },
    {
      id: "3",
      classId: "math43",
      className: "MATH 43",
      title: "Homework 8",
      type: "Homework",
      dueDate: "2025-11-03",
      status: "Submitted",
      priority: "Medium",
      completed: true,
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAssignments(prev => 
        prev.map(assignment => ({
          ...assignment,
          status: autoUpdateStatus(assignment)
        }))
      );
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const handleAddAssignment = (newAssignment: Omit<Assignment, "id">) => {
    const assignment: Assignment = {
      ...newAssignment,
      id: Date.now().toString(),
    };
    setAssignments([...assignments, assignment]);
  };

  const handleUpdateStatus = (id: string, status: AssignmentStatus) => {
    setAssignments(prev =>
      prev.map(assignment =>
        assignment.id === id 
          ? { 
              ...assignment, 
              status,
              completed: status === "Completed" || status === "Submitted"
            }
          : assignment
      )
    );
  };

  const handleToggleComplete = (id: string) => {
    setAssignments(prev =>
      prev.map(assignment =>
        assignment.id === id
          ? {
              ...assignment,
              completed: !assignment.completed,
              status: !assignment.completed ? "Completed" : "Not Started"
            }
          : assignment
      )
    );
  };

  const sortedAssignments = [...assignments].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <h1 className="text-3xl font-bold text-foreground">Assignment Tracker</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your coursework with ease</p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-8 py-4">
            <button className="flex items-center gap-2 border-b-2 border-primary pb-2 text-sm font-medium text-primary transition-colors">
              <LayoutList className="h-4 w-4" />
              Masterlist
            </button>
            <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              <CheckSquare className="h-4 w-4" />
              To-Do
            </button>
            <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              <BookOpen className="h-4 w-4" />
              My Classes
            </button>
            <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              <Calendar className="h-4 w-4" />
              Calendar
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="space-y-6">
          {/* Stats and Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <StatsBar assignments={assignments} />
            <AddAssignmentDialog onAdd={handleAddAssignment} />
          </div>

          {/* Assignments Table */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-foreground">All Assignments</h2>
            <AssignmentTable
              assignments={sortedAssignments}
              onUpdateStatus={handleUpdateStatus}
              onToggleComplete={handleToggleComplete}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
