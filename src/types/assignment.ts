export type AssignmentStatus = 
  | "Not Started" 
  | "In Progress" 
  | "Submitted" 
  | "Completed" 
  | "Overdue";

export type AssignmentType = 
  | "Homework" 
  | "Reading" 
  | "Quiz" 
  | "Project" 
  | "Exam" 
  | "Coding"
  | "Recitation"
  | "Other";

export type Priority = "High" | "Medium" | "Low";

export interface Assignment {
  id: string;
  classId: string;
  className: string; // e.g., "CSE 109"
  title: string;
  type: AssignmentType;
  dueDate: string; // ISO date string
  dueTime?: string;
  status: AssignmentStatus;
  priority: Priority;
  notes?: string;
  weight?: number;
  completed: boolean;
}

export interface Class {
  id: string;
  courseCode: string;
  courseTitle: string;
  instructor: string;
  schedule: string;
  color: string; // Pastel color for UI
}
