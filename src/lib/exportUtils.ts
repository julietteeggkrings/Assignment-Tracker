import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Assignment, Class } from '@/types/assignment';
import { format } from 'date-fns';

export function getCurrentDate() {
  return format(new Date(), 'yyyy-MM-dd');
}

function downloadFile(content: string | Blob, filename: string, mimeType: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Export Masterlist to CSV
export function exportMasterlistToCSV(assignments: Assignment[]) {
  const data = assignments.map(assignment => ({
    'To-Do': assignment.addedToToDo ? 'Yes' : 'No',
    'Status': assignment.status,
    'Due Date': assignment.dueDate,
    'Due Time': assignment.dueTime || '',
    'Class': assignment.className,
    'Type': assignment.type,
    'Assignment': assignment.title,
    'Priority': assignment.toDoPriority || '',
    'Notes': assignment.notes || '',
    'Completed': assignment.completed ? 'Yes' : 'No'
  }));

  const csv = Papa.unparse(data);
  downloadFile(csv, `assignments-${getCurrentDate()}.csv`, 'text/csv');
}

// Export To-Do List to CSV
export function exportToDoToCSV(tasks: Assignment[]) {
  const data = tasks.map(task => ({
    'Completed': task.toDoCompleted ? 'Yes' : 'No',
    'Priority': task.toDoPriority,
    'Date': task.dueDate,
    'Class': task.className,
    'Task': task.title,
    'Notes': task.notes || ''
  }));

  const csv = Papa.unparse(data);
  downloadFile(csv, `todo-list-${getCurrentDate()}.csv`, 'text/csv');
}

// Export Classes to CSV
export function exportClassesToCSV(classes: Class[], assignments: Assignment[]) {
  const data = classes.map(classItem => {
    const classAssignments = assignments.filter(a => a.classId === classItem.id);
    const completed = classAssignments.filter(a => 
      a.status === 'Submitted' || a.status === 'Completed'
    ).length;
    
    return {
      'Course Code': classItem.courseCode,
      'Course Title': classItem.courseTitle,
      'Professor': classItem.instructor,
      'Schedule': classItem.schedule,
      'Total Assignments': classAssignments.length,
      'Completed': completed,
      'Percent Complete': `${classAssignments.length > 0 ? ((completed / classAssignments.length) * 100).toFixed(1) : 0}%`
    };
  });

  const csv = Papa.unparse(data);
  downloadFile(csv, `classes-summary-${getCurrentDate()}.csv`, 'text/csv');
}

// Export Masterlist to Excel
export function exportMasterlistToExcel(assignments: Assignment[]) {
  const data = assignments.map(assignment => ({
    'To-Do': assignment.addedToToDo ? 'Yes' : 'No',
    'Status': assignment.status,
    'Due Date': assignment.dueDate,
    'Due Time': assignment.dueTime || '',
    'Class': assignment.className,
    'Type': assignment.type,
    'Assignment': assignment.title,
    'Priority': assignment.toDoPriority || '',
    'Notes': assignment.notes || '',
    'Completed': assignment.completed ? 'Yes' : 'No'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Assignments');

  // Auto-size columns
  const maxWidth = 50;
  const colWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.min(
      Math.max(
        key.length,
        ...data.map(row => String(row[key as keyof typeof row] || '').length)
      ),
      maxWidth
    )
  }));
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, `assignments-${getCurrentDate()}.xlsx`);
}

// Export To-Do List to Excel
export function exportToDoToExcel(tasks: Assignment[]) {
  const data = tasks.map(task => ({
    'Completed': task.toDoCompleted ? 'Yes' : 'No',
    'Priority': task.toDoPriority,
    'Date': task.dueDate,
    'Class': task.className,
    'Task': task.title,
    'Notes': task.notes || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'To-Do List');

  const maxWidth = 50;
  const colWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.min(
      Math.max(
        key.length,
        ...data.map(row => String(row[key as keyof typeof row] || '').length)
      ),
      maxWidth
    )
  }));
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, `todo-list-${getCurrentDate()}.xlsx`);
}

// Export Classes to Excel
export function exportClassesToExcel(classes: Class[], assignments: Assignment[]) {
  const data = classes.map(classItem => {
    const classAssignments = assignments.filter(a => a.classId === classItem.id);
    const completed = classAssignments.filter(a => 
      a.status === 'Submitted' || a.status === 'Completed'
    ).length;
    
    return {
      'Course Code': classItem.courseCode,
      'Course Title': classItem.courseTitle,
      'Professor': classItem.instructor,
      'Schedule': classItem.schedule,
      'Total Assignments': classAssignments.length,
      'Completed': completed,
      'Percent Complete': `${classAssignments.length > 0 ? ((completed / classAssignments.length) * 100).toFixed(1) : 0}%`
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Classes');

  const maxWidth = 50;
  const colWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.min(
      Math.max(
        key.length,
        ...data.map(row => String(row[key as keyof typeof row] || '').length)
      ),
      maxWidth
    )
  }));
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, `classes-summary-${getCurrentDate()}.xlsx`);
}

// Copy to Clipboard
export function copyToClipboard(assignments: Assignment[]) {
  const text = assignments.map(a => 
    `${a.className}\t${a.type}\t${a.title}\t${a.dueDate}\t${a.status}`
  ).join('\n');

  return navigator.clipboard.writeText(text);
}
