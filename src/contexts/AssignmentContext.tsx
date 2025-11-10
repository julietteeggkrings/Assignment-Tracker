import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Assignment, AssignmentStatus, Class, ToDoPriority } from "@/types/assignment";
import { autoUpdateStatus } from "@/lib/assignmentUtils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "@/hooks/use-toast";

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
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [classes, setClasses] = useState<Class[]>([]);

  // Load data from Supabase
  useEffect(() => {
    if (!user) {
      setAssignments([]);
      setClasses([]);
      return;
    }

    loadAssignments();
    loadClasses();

    // Subscribe to realtime changes
    const assignmentsSubscription = supabase
      .channel('assignments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments', filter: `user_id=eq.${user.id}` }, loadAssignments)
      .subscribe();

    const classesSubscription = supabase
      .channel('classes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'classes', filter: `user_id=eq.${user.id}` }, loadClasses)
      .subscribe();

    return () => {
      assignmentsSubscription.unsubscribe();
      classesSubscription.unsubscribe();
    };
  }, [user]);

  const loadAssignments = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error loading assignments:', error);
      toast({ title: "Error", description: "Failed to load assignments", variant: "destructive" });
      return;
    }

    if (data) {
      const formattedAssignments: Assignment[] = data.map(a => ({
        id: a.id,
        classId: a.class_id,
        className: a.class_name,
        title: a.title,
        type: a.type as Assignment['type'],
        dueDate: a.due_date,
        dueTime: a.due_time,
        status: a.status as AssignmentStatus,
        priority: a.priority as Assignment['priority'],
        notes: a.notes,
        weight: a.weight,
        completed: a.completed,
        addedToToDo: a.added_to_todo,
        toDoCompleted: a.todo_completed,
        toDoPriority: a.todo_priority as ToDoPriority,
      }));
      setAssignments(formattedAssignments);
    }
  };

  const loadClasses = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading classes:', error);
      return;
    }

    if (data) {
      const formattedClasses: Class[] = data.map(c => ({
        id: c.id,
        courseCode: c.course_code,
        courseTitle: c.course_title,
        instructor: c.instructor,
        schedule: c.schedule,
        color: c.color,
      }));
      setClasses(formattedClasses);
    }
  };

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

  const addAssignment = async (newAssignment: Omit<Assignment, "id">) => {
    if (!user) return;

    const { error } = await supabase.from('assignments').insert({
      user_id: user.id,
      class_id: newAssignment.classId,
      class_name: newAssignment.className,
      title: newAssignment.title,
      type: newAssignment.type,
      due_date: newAssignment.dueDate,
      due_time: newAssignment.dueTime,
      status: newAssignment.status,
      priority: newAssignment.priority,
      notes: newAssignment.notes,
      weight: newAssignment.weight,
      completed: newAssignment.completed,
      added_to_todo: newAssignment.addedToToDo,
      todo_completed: newAssignment.toDoCompleted,
      todo_priority: newAssignment.toDoPriority,
    });

    if (error) {
      console.error('Error adding assignment:', error);
      toast({ title: "Error", description: "Failed to add assignment", variant: "destructive" });
    }
  };

  const updateAssignment = async (id: string, updates: Partial<Assignment>) => {
    if (!user) return;

    const dbUpdates: any = {};
    if (updates.classId) dbUpdates.class_id = updates.classId;
    if (updates.className) dbUpdates.class_name = updates.className;
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.type) dbUpdates.type = updates.type;
    if (updates.dueDate) dbUpdates.due_date = updates.dueDate;
    if (updates.dueTime !== undefined) dbUpdates.due_time = updates.dueTime;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.priority) dbUpdates.priority = updates.priority;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.weight !== undefined) dbUpdates.weight = updates.weight;
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
    if (updates.addedToToDo !== undefined) dbUpdates.added_to_todo = updates.addedToToDo;
    if (updates.toDoCompleted !== undefined) dbUpdates.todo_completed = updates.toDoCompleted;
    if (updates.toDoPriority) dbUpdates.todo_priority = updates.toDoPriority;

    const { error } = await supabase
      .from('assignments')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating assignment:', error);
      toast({ title: "Error", description: "Failed to update assignment", variant: "destructive" });
    }
  };

  const deleteAssignment = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting assignment:', error);
      toast({ title: "Error", description: "Failed to delete assignment", variant: "destructive" });
    }
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

  const addClass = async (classData: Omit<Class, "id">) => {
    if (!user) return;

    const { error } = await supabase.from('classes').insert({
      user_id: user.id,
      course_code: classData.courseCode,
      course_title: classData.courseTitle,
      instructor: classData.instructor,
      schedule: classData.schedule,
      color: classData.color,
    });

    if (error) {
      console.error('Error adding class:', error);
      toast({ title: "Error", description: "Failed to add class", variant: "destructive" });
    }
  };

  const updateClass = async (id: string, updates: Partial<Class>) => {
    if (!user) return;

    const dbUpdates: any = {};
    if (updates.courseCode) dbUpdates.course_code = updates.courseCode;
    if (updates.courseTitle) dbUpdates.course_title = updates.courseTitle;
    if (updates.instructor) dbUpdates.instructor = updates.instructor;
    if (updates.schedule) dbUpdates.schedule = updates.schedule;
    if (updates.color) dbUpdates.color = updates.color;

    const { error } = await supabase
      .from('classes')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating class:', error);
      toast({ title: "Error", description: "Failed to update class", variant: "destructive" });
    }
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
