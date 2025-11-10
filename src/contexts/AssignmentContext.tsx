import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Assignment, AssignmentStatus, Class, ToDoPriority } from "@/types/assignment";
import { autoUpdateStatus } from "@/lib/assignmentUtils";

interface AssignmentContextType {
  assignments: Assignment[];
  classes: Class[];
  addAssignment: (assignment: Omit<Assignment, "id">) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  updateStatus: (id: string, status: AssignmentStatus) => void;
  toggleComplete: (id: string) => void;
  toggleToDoStatus: (id: string) => void;
  toggleToDoComplete: (id: string) => void;
  updateToDoPriority: (id: string, priority: ToDoPriority) => void;
  addClass: (classData: Omit<Class, "id">) => void;
  updateClass: (id: string, updates: Partial<Class>) => void;
}

const AssignmentContext = createContext<AssignmentContextType | undefined>(undefined);

export const useAssignments = () => {
  const context = useContext(AssignmentContext);
  if (!context) {
    throw new Error("useAssignments must be used within AssignmentProvider");
  }
  return context;
};

export const AssignmentProvider = ({ children }: { children: ReactNode }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: "1",
      classId: "cse262",
      className: "CSE 262",
      title: "Quiz 5",
      type: "Quiz",
      dueDate: "2025-11-13",
      status: "Not Started",
      priority: "High",
      completed: false,
      addedToToDo: true,
      toDoCompleted: false,
      toDoPriority: "High",
    },
    {
      id: "2",
      classId: "cse241",
      className: "CSE 241",
      title: "Homework 1",
      type: "Homework",
      dueDate: "2025-11-15",
      status: "In Progress",
      priority: "High",
      completed: false,
      addedToToDo: true,
      toDoCompleted: false,
      toDoPriority: "Low",
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
      addedToToDo: false,
      toDoCompleted: false,
      toDoPriority: "Low",
    },
    {
      id: "4",
      classId: "cse262",
      className: "CSE 262",
      title: "Reading 15.0-15.6",
      type: "Reading",
      dueDate: "2025-11-20",
      status: "Not Started",
      priority: "Low",
      completed: false,
      addedToToDo: false,
      toDoCompleted: false,
      toDoPriority: "Low",
    },
    {
      id: "5",
      classId: "cse109",
      className: "CSE 109",
      title: "Project 2",
      type: "Project",
      dueDate: "2025-11-25",
      status: "In Progress",
      priority: "High",
      completed: false,
      addedToToDo: true,
      toDoCompleted: false,
      toDoPriority: "High",
    },
  ]);

  const [classes, setClasses] = useState<Class[]>([
    {
      id: "cse262",
      courseCode: "CSE 262",
      courseTitle: "Programming Languages",
      instructor: "Dr. Smith",
      schedule: "Mon/Wed 10:00 AM",
      color: "pastel-lavender",
    },
    {
      id: "cse241",
      courseCode: "CSE 241",
      courseTitle: "Systems Programming",
      instructor: "Dr. Johnson",
      schedule: "Tue/Thu 2:00 PM",
      color: "pastel-pink",
    },
    {
      id: "math43",
      courseCode: "MATH 43",
      courseTitle: "Calculus III",
      instructor: "Prof. Williams",
      schedule: "Mon/Wed/Fri 9:00 AM",
      color: "pastel-mint",
    },
    {
      id: "cse109",
      courseCode: "CSE 109",
      courseTitle: "Software Engineering",
      instructor: "Dr. Davis",
      schedule: "Tue/Thu 11:00 AM",
      color: "pastel-peach",
    },
  ]);

  // Auto-update overdue assignments
  useEffect(() => {
    const interval = setInterval(() => {
      setAssignments(prev =>
        prev.map(assignment => ({
          ...assignment,
          status: autoUpdateStatus(assignment),
        }))
      );
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const addAssignment = (newAssignment: Omit<Assignment, "id">) => {
    const assignment: Assignment = {
      ...newAssignment,
      id: Date.now().toString(),
    };
    setAssignments(prev => [...prev, assignment]);
  };

  const updateAssignment = (id: string, updates: Partial<Assignment>) => {
    setAssignments(prev =>
      prev.map(assignment =>
        assignment.id === id ? { ...assignment, ...updates } : assignment
      )
    );
  };

  const deleteAssignment = (id: string) => {
    setAssignments(prev => prev.filter(assignment => assignment.id !== id));
  };

  const updateStatus = (id: string, status: AssignmentStatus) => {
    setAssignments(prev =>
      prev.map(assignment =>
        assignment.id === id
          ? {
              ...assignment,
              status,
              completed: status === "Completed" || status === "Submitted",
            }
          : assignment
      )
    );
  };

  const toggleComplete = (id: string) => {
    setAssignments(prev =>
      prev.map(assignment =>
        assignment.id === id
          ? {
              ...assignment,
              completed: !assignment.completed,
              status: !assignment.completed ? "Completed" : "Not Started",
            }
          : assignment
      )
    );
  };

  const toggleToDoStatus = (id: string) => {
    setAssignments(prev =>
      prev.map(assignment =>
        assignment.id === id
          ? {
              ...assignment,
              addedToToDo: !assignment.addedToToDo,
              // Reset To-Do completion when removed from list
              toDoCompleted: !assignment.addedToToDo ? false : assignment.toDoCompleted,
            }
          : assignment
      )
    );
  };

  const toggleToDoComplete = (id: string) => {
    setAssignments(prev =>
      prev.map(assignment =>
        assignment.id === id
          ? {
              ...assignment,
              toDoCompleted: !assignment.toDoCompleted,
            }
          : assignment
      )
    );
  };

  const updateToDoPriority = (id: string, priority: ToDoPriority) => {
    setAssignments(prev =>
      prev.map(assignment =>
        assignment.id === id ? { ...assignment, toDoPriority: priority } : assignment
      )
    );
  };

  const addClass = (classData: Omit<Class, "id">) => {
    const newClass: Class = {
      ...classData,
      id: Date.now().toString(),
    };
    setClasses(prev => [...prev, newClass]);
  };

  const updateClass = (id: string, updates: Partial<Class>) => {
    setClasses(prev =>
      prev.map(cls => (cls.id === id ? { ...cls, ...updates } : cls))
    );
  };

  return (
    <AssignmentContext.Provider
      value={{
        assignments,
        classes,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        updateStatus,
        toggleComplete,
        toggleToDoStatus,
        toggleToDoComplete,
        updateToDoPriority,
        addClass,
        updateClass,
      }}
    >
      {children}
    </AssignmentContext.Provider>
  );
};
