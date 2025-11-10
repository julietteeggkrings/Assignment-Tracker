import { useState } from "react";
import { AssignmentProvider, useAssignments } from "@/contexts/AssignmentContext";
import { AssignmentTable } from "@/components/AssignmentTable";
import { AddAssignmentDialog } from "@/components/AddAssignmentDialog";
import { StatsBar } from "@/components/StatsBar";
import { ToDoView } from "@/components/ToDoView";
import { MyClassesView } from "@/components/MyClassesView";
import { CalendarView } from "@/components/CalendarView";
import { BookOpen, Calendar, CheckSquare, LayoutList } from "lucide-react";

type ViewType = "masterlist" | "todo" | "classes" | "calendar";

const MainContent = () => {
  const [currentView, setCurrentView] = useState<ViewType>("masterlist");
  const { assignments, updateStatus, toggleComplete, addAssignment, toggleToDoStatus } = useAssignments();

  const sortedAssignments = [...assignments].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const navItems = [
    { id: "masterlist" as ViewType, label: "Masterlist", icon: LayoutList },
    { id: "todo" as ViewType, label: "To-Do", icon: CheckSquare },
    { id: "classes" as ViewType, label: "My Classes", icon: BookOpen },
    { id: "calendar" as ViewType, label: "Calendar", icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <h1 className="text-3xl font-bold text-foreground">Assignment Tracker</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your coursework with ease
          </p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-8 py-4">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-2 pb-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {currentView === "masterlist" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <StatsBar assignments={assignments} />
              <AddAssignmentDialog onAdd={addAssignment} />
            </div>
            <div>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                All Assignments
              </h2>
              <AssignmentTable
                assignments={sortedAssignments}
                onUpdateStatus={updateStatus}
                onToggleComplete={toggleComplete}
                onToggleToDoStatus={toggleToDoStatus}
              />
            </div>
          </div>
        )}

        {currentView === "todo" && <ToDoView />}
        {currentView === "classes" && <MyClassesView />}
        {currentView === "calendar" && <CalendarView />}
      </main>
    </div>
  );
};

const Index = () => {
  return (
    <AssignmentProvider>
      <MainContent />
    </AssignmentProvider>
  );
};

export default Index;
