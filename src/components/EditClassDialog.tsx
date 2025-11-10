import { useState } from "react";
import { Class } from "@/types/assignment";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditClassDialogProps {
  classData: Class;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (classId: string, updatedData: Partial<Class>) => void;
}

const PRESET_COLORS = [
  '#FFD7E5', // Pink
  '#FFE5D0', // Peach
  '#E5D7FF', // Lavender
  '#D0FFE5', // Mint
  '#FFFAF0', // Cream
  '#D0E5FF', // Sky Blue
  '#FFE5F0', // Light Pink
  '#FFD7C0', // Coral
];

export const EditClassDialog = ({ classData, open, onOpenChange, onSave }: EditClassDialogProps) => {
  const [formData, setFormData] = useState({
    courseCode: classData.courseCode,
    courseTitle: classData.courseTitle,
    instructor: classData.instructor,
    schedule: classData.schedule,
    color: classData.color || '#E5D7FF',
  });

  const handleSave = () => {
    console.log('Saving class with color:', formData.color);
    onSave(classData.id, formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Class</DialogTitle>
          <DialogDescription>
            Update class details and customize the color used throughout the app
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="courseCode">Course Code</Label>
            <Input
              id="courseCode"
              value={formData.courseCode}
              onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="courseTitle">Course Title</Label>
            <Input
              id="courseTitle"
              value={formData.courseTitle}
              onChange={(e) => setFormData({ ...formData, courseTitle: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructor">Professor</Label>
            <Input
              id="instructor"
              value={formData.instructor}
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule">Schedule</Label>
            <Input
              id="schedule"
              value={formData.schedule}
              onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Class Color</Label>
            <p className="text-sm text-muted-foreground">
              This color identifies this class throughout the app
            </p>

            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="h-10 w-16 cursor-pointer rounded border border-border"
              />
              <div
                className="h-10 w-16 rounded border-2 border-border"
                style={{ backgroundColor: formData.color }}
              />
              <span className="text-sm font-mono text-muted-foreground">
                {formData.color.toUpperCase()}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Quick presets:</p>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className="h-10 w-10 rounded-full border-2 border-transparent transition-all hover:scale-110 hover:border-foreground"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
