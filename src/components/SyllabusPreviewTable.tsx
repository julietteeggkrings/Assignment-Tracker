import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus } from "lucide-react";
import { Assignment, AssignmentType } from "@/types/assignment";
import { v4 as uuidv4 } from 'uuid';

interface ParsedAssignment {
  title: string;
  type: string;
  dueDate: string;
  dueTime?: string;
  weight?: number;
  notes?: string;
}

interface EditableAssignment extends ParsedAssignment {
  id: string;
  included: boolean;
}

interface SyllabusPreviewTableProps {
  assignments: ParsedAssignment[];
  courseInfo: {
    courseCode: string;
    courseTitle: string;
    instructor: string;
    color: string;
  };
  onConfirm: (assignments: Omit<Assignment, "id">[]) => void;
  onBack: () => void;
}

export const SyllabusPreviewTable = ({
  assignments,
  courseInfo,
  onConfirm,
  onBack,
}: SyllabusPreviewTableProps) => {
  const [editableAssignments, setEditableAssignments] = useState<EditableAssignment[]>(
    assignments.map((a) => ({
      ...a,
      id: uuidv4(),
      included: true,
    }))
  );

  const updateAssignment = (id: string, field: string, value: any) => {
    setEditableAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const removeAssignment = (id: string) => {
    setEditableAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  const addNewAssignment = () => {
    setEditableAssignments((prev) => [
      ...prev,
      {
        id: uuidv4(),
        title: "",
        type: "Homework",
        dueDate: new Date().toISOString().split("T")[0],
        dueTime: "",
        weight: undefined,
        notes: "",
        included: true,
      },
    ]);
  };

  const handleConfirm = () => {
    const finalAssignments: Omit<Assignment, "id">[] = editableAssignments
      .filter((a) => a.included && a.title.trim())
      .map((a) => ({
        classId: courseInfo.courseCode,
        className: `${courseInfo.courseCode} - ${courseInfo.courseTitle}`,
        title: a.title,
        type: a.type as AssignmentType,
        dueDate: a.dueDate,
        dueTime: a.dueTime,
        status: "Status",
        priority: "Medium",
        notes: a.notes,
        weight: a.weight,
        completed: false,
        addedToToDo: false,
        toDoCompleted: false,
        toDoPriority: "Low",
      }));

    onConfirm(finalAssignments);
  };

  const includedCount = editableAssignments.filter((a) => a.included).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {includedCount > 0 ? (
              <span className="text-green-600">Found {includedCount} assignments</span>
            ) : (
              <span className="text-muted-foreground">No assignments selected</span>
            )}
          </h3>
          <p className="text-sm text-muted-foreground">
            Review and edit before adding to Masterlist
          </p>
        </div>
        <Button onClick={addNewAssignment} variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Assignment
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-[50px]">Include</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-[140px]">Type</TableHead>
                <TableHead className="w-[140px]">Due Date</TableHead>
                <TableHead className="w-[120px]">Time</TableHead>
                <TableHead className="w-[100px]">Weight</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {editableAssignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>
                    <Checkbox
                      checked={assignment.included}
                      onCheckedChange={(checked) =>
                        updateAssignment(assignment.id, "included", checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={assignment.title}
                      onChange={(e) =>
                        updateAssignment(assignment.id, "title", e.target.value)
                      }
                      placeholder="Assignment title"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={assignment.type}
                      onValueChange={(value) =>
                        updateAssignment(assignment.id, "type", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Homework">Homework</SelectItem>
                        <SelectItem value="Reading">Reading</SelectItem>
                        <SelectItem value="Quiz">Quiz</SelectItem>
                        <SelectItem value="Project">Project</SelectItem>
                        <SelectItem value="Exam">Exam</SelectItem>
                        <SelectItem value="Coding">Coding</SelectItem>
                        <SelectItem value="Recitation">Recitation</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="date"
                      value={assignment.dueDate}
                      onChange={(e) =>
                        updateAssignment(assignment.id, "dueDate", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="time"
                      value={assignment.dueTime || ""}
                      onChange={(e) =>
                        updateAssignment(assignment.id, "dueTime", e.target.value)
                      }
                      placeholder="Optional"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={assignment.weight || ""}
                      onChange={(e) =>
                        updateAssignment(
                          assignment.id,
                          "weight",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      placeholder="Points"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAssignment(assignment.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex justify-between gap-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={includedCount === 0}
          className="bg-accent text-accent-foreground hover:bg-accent/80"
        >
          Add {includedCount} Assignment{includedCount !== 1 ? "s" : ""}
        </Button>
      </div>
    </div>
  );
};
