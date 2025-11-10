import { useAssignments } from "@/contexts/AssignmentContext";
import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, User, Pencil } from "lucide-react";
import { ExportDropdown } from "@/components/ExportDropdown";
import { exportClassesToCSV, exportClassesToExcel, copyToClipboard } from "@/lib/exportUtils";
import { getContrastColor } from "@/lib/colorUtils";
import { toast } from "@/hooks/use-toast";
import { EditClassDialog } from "@/components/EditClassDialog";
import { useState } from "react";
import { Class } from "@/types/assignment";

export const MyClassesView = () => {
  const { assignments, classes, updateClass } = useAssignments();
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  const today = format(new Date(), "EEEE, MMMM d, yyyy");

  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(
    a => a.status === "Completed" || a.status === "Submitted"
  ).length;
  const overallProgress = totalAssignments > 0
    ? Math.round((completedAssignments / totalAssignments) * 100)
    : 0;

  const getClassStats = (classId: string) => {
    const classAssignments = assignments.filter(a => a.classId === classId);
    const total = classAssignments.length;
    const completed = classAssignments.filter(
      a => a.status === "Completed" || a.status === "Submitted"
    ).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  };

  const handleExportCSV = () => {
    exportClassesToCSV(classes, assignments);
    toast({ title: "Success", description: `Exported ${classes.length} classes to CSV` });
  };

  const handleExportExcel = () => {
    exportClassesToExcel(classes, assignments);
    toast({ title: "Success", description: `Exported ${classes.length} classes to Excel` });
  };

  const handleCopyClipboard = async () => {
    await copyToClipboard(assignments);
    toast({ title: "Success", description: "Copied to clipboard" });
  };

  const handleUpdateClass = async (classId: string, updatedData: Partial<Class>) => {
    await updateClass(classId, updatedData);
    toast({ 
      title: "Success", 
      description: "✓ Class updated successfully!" 
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border-none bg-pastel-mint shadow-md">
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Today</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{today}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Assignments</p>
              <p className="mt-1 text-3xl font-bold text-black dark:text-white">{totalAssignments}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="mt-1 text-3xl font-bold text-black dark:text-white">
                {completedAssignments}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
              <div className="mt-2 space-y-2">
                <Progress value={overallProgress} className="h-2" />
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{overallProgress}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">My Classes</h2>
        <div className="flex gap-2">
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onCopyClipboard={handleCopyClipboard}
          />
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4" />
            Add Class
          </Button>
        </div>
      </div>

      {/* Class Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {classes.map(classData => {
          const stats = getClassStats(classData.id);
          const classColor = classData.color || "#E5DEFF";
          
          return (
            <Card
              key={classData.id}
              className="overflow-hidden shadow-md transition-all hover:shadow-lg"
            >
              <CardHeader 
                className="p-4 relative"
                style={{ backgroundColor: classColor }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 hover:bg-white/20"
                  onClick={() => setEditingClass(classData)}
                  style={{ color: getContrastColor(classColor) }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <h3 
                  className="text-xl font-bold"
                  style={{ color: getContrastColor(classColor) }}
                >
                  {classData.courseCode}
                </h3>
                <p 
                  className="text-sm font-medium opacity-80"
                  style={{ color: getContrastColor(classColor) }}
                >
                  {classData.courseTitle}
                </p>
              </CardHeader>
              <CardContent className="space-y-4 bg-card p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{classData.schedule}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{classData.instructor}</span>
                </div>
                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">
                      {stats.completed} / {stats.total}
                    </span>
                  </div>
                  <div className="relative">
                    <Progress value={stats.percentage} className="h-2 bg-muted" />
                    <div 
                      className="absolute top-0 left-0 h-2 rounded-full transition-all"
                      style={{ 
                        backgroundColor: classColor,
                        width: `${stats.percentage}%` 
                      }}
                    />
                  </div>
                  <div className="text-right">
                    <span 
                      className="text-2xl font-bold"
                      style={{ color: classColor }}
                    >
                      {stats.percentage}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {editingClass && (
        <EditClassDialog
          classData={editingClass}
          open={!!editingClass}
          onOpenChange={(open) => !open && setEditingClass(null)}
          onSave={handleUpdateClass}
        />
      )}
    </div>
  );
};
