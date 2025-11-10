import { useAssignments } from "@/contexts/AssignmentContext";
import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, User } from "lucide-react";
import { ExportDropdown } from "@/components/ExportDropdown";
import { exportClassesToCSV, exportClassesToExcel, copyToClipboard } from "@/lib/exportUtils";
import { toast } from "@/hooks/use-toast";

export const MyClassesView = () => {
  const { assignments, classes } = useAssignments();

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

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      "pastel-pink": "bg-pastel-pink",
      "pastel-peach": "bg-pastel-peach",
      "pastel-lavender": "bg-pastel-lavender",
      "pastel-mint": "bg-pastel-mint",
    };
    return colorMap[color] || "bg-pastel-lavender";
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
          return (
            <Card
              key={classData.id}
              className="overflow-hidden shadow-md transition-all hover:shadow-lg"
            >
              <CardHeader className={`${getColorClass(classData.color)} p-4`}>
                <h3 className="text-xl font-bold text-foreground">
                  {classData.courseCode}
                </h3>
                <p className="text-sm font-medium text-foreground/80">
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
                  <Progress value={stats.percentage} className="h-2" />
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                      {stats.percentage}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
