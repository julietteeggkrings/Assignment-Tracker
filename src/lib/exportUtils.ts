import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { Assignment, Class } from '@/types/assignment';
import { format } from 'date-fns';
import { calculateDaysUntilDue, getStatusColor } from './assignmentUtils';

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
export async function exportMasterlistToExcel(assignments: Assignment[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Assignments');
  
  // Define columns
  worksheet.columns = [
    { header: 'TO-DO', key: 'toDo', width: 10 },
    { header: 'STATUS', key: 'status', width: 15 },
    { header: 'DUE DATE', key: 'dueDate', width: 12 },
    { header: 'DUE TIME', key: 'dueTime', width: 10 },
    { header: 'CLASS', key: 'class', width: 20 },
    { header: 'TYPE', key: 'type', width: 12 },
    { header: 'ASSIGNMENT', key: 'title', width: 35 },
    { header: 'DAYS UNTIL DUE', key: 'daysUntilDue', width: 15 },
    { header: 'PRIORITY', key: 'priority', width: 12 },
    { header: 'NOTES', key: 'notes', width: 30 },
    { header: 'COMPLETED', key: 'completed', width: 12 }
  ];
  
  // Style header row
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4B5563' }
  };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 25;
  
  // Add data rows
  assignments.forEach((assignment) => {
    const daysUntil = calculateDaysUntilDue(assignment.dueDate);
    
    const row = worksheet.addRow({
      toDo: assignment.addedToToDo ? 'Yes' : 'No',
      status: assignment.status,
      dueDate: assignment.dueDate,
      dueTime: assignment.dueTime || '',
      class: assignment.className,
      type: assignment.type,
      title: assignment.title,
      daysUntilDue: daysUntil,
      priority: assignment.toDoPriority || '',
      notes: assignment.notes || '',
      completed: assignment.completed ? 'Yes' : 'No'
    });
    
    // Determine row background color
    let rowColor = 'FFFFFFFF'; // White
    if (assignment.status === 'Submitted' || assignment.status === 'Completed') {
      rowColor = 'FFD1D5DB'; // Grey
    } else if (daysUntil < 0) {
      rowColor = 'FFFEE2E2'; // Light red (overdue)
    } else if (daysUntil <= 2 && daysUntil >= 0) {
      rowColor = 'FFFEF3C7'; // Light yellow (due soon)
    }
    
    row.eachCell((cell, colNumber) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: rowColor }
      };
      
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
      };
      
      cell.alignment = { vertical: 'middle' };
      
      // STATUS column styling (col 2)
      if (colNumber === 2) {
        let statusColor = 'FFFFFFFF';
        if (assignment.status === 'Not Started') statusColor = 'FFFEE2E2'; // Red
        if (assignment.status === 'In Progress') statusColor = 'FFFED7AA'; // Orange
        if (assignment.status === 'Submitted') statusColor = 'FFD1D5DB'; // Grey
        if (assignment.status === 'Completed') statusColor = 'FFBBF7D0'; // Green
        if (assignment.status === 'Overdue') statusColor = 'FFFECACA'; // Dark red
        
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: statusColor }
        };
        cell.font = { bold: true };
      }
      
      // CLASS column styling (col 5)
      if (colNumber === 5) {
        cell.font = { bold: true };
      }
      
      // DAYS UNTIL DUE column styling (col 8)
      if (colNumber === 8) {
        if (daysUntil < 0) {
          cell.font = { color: { argb: 'FFDC2626' }, bold: true }; // Red
        } else if (daysUntil <= 2) {
          cell.font = { color: { argb: 'FFF59E0B' }, bold: true }; // Orange
        }
      }
    });
    
    row.height = 20;
  });
  
  // Freeze header row
  worksheet.views = [
    { state: 'frozen', xSplit: 0, ySplit: 1 }
  ];
  
  // Generate file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `assignments-${getCurrentDate()}.xlsx`;
  link.click();
  
  URL.revokeObjectURL(url);
}

// Export To-Do List to Excel
export async function exportToDoToExcel(tasks: Assignment[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('To-Do List');
  
  // Define columns
  worksheet.columns = [
    { header: 'COMPLETED', key: 'completed', width: 12 },
    { header: 'PRIORITY', key: 'priority', width: 12 },
    { header: 'DATE', key: 'date', width: 12 },
    { header: 'CLASS', key: 'class', width: 20 },
    { header: 'TASK', key: 'task', width: 35 },
    { header: 'NOTES', key: 'notes', width: 30 }
  ];
  
  // Style header row
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4B5563' }
  };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 25;
  
  // Add data rows
  tasks.forEach((task) => {
    const row = worksheet.addRow({
      completed: task.toDoCompleted ? 'Yes' : 'No',
      priority: task.toDoPriority,
      date: task.dueDate,
      class: task.className,
      task: task.title,
      notes: task.notes || ''
    });
    
    // Determine row background color
    let rowColor = 'FFFFFFFF'; // White
    if (task.toDoCompleted) {
      rowColor = 'FFD1D5DB'; // Grey for completed
    } else if (task.toDoPriority === 'High') {
      rowColor = 'FFFEE2E2'; // Light red for high priority
    } else if (task.toDoPriority === 'Low') {
      rowColor = 'FFBBF7D0'; // Light green for low priority
    }
    
    row.eachCell((cell, colNumber) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: rowColor }
      };
      
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
      };
      
      cell.alignment = { vertical: 'middle' };
      
      // PRIORITY column styling (col 2)
      if (colNumber === 2) {
        let priorityColor = 'FFFFFFFF';
        if (task.toDoPriority === 'High') priorityColor = 'FFFEE2E2'; // Red
        if (task.toDoPriority === 'Low') priorityColor = 'FFBBF7D0'; // Green
        
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: priorityColor }
        };
        cell.font = { bold: true };
      }
      
      // CLASS column styling (col 4)
      if (colNumber === 4) {
        cell.font = { bold: true };
      }
    });
    
    row.height = 20;
  });
  
  // Freeze header row
  worksheet.views = [
    { state: 'frozen', xSplit: 0, ySplit: 1 }
  ];
  
  // Generate file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `todo-list-${getCurrentDate()}.xlsx`;
  link.click();
  
  URL.revokeObjectURL(url);
}

// Export Classes to Excel
export async function exportClassesToExcel(classes: Class[], assignments: Assignment[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Classes');
  
  // Define columns
  worksheet.columns = [
    { header: 'COURSE CODE', key: 'courseCode', width: 15 },
    { header: 'COURSE TITLE', key: 'courseTitle', width: 30 },
    { header: 'PROFESSOR', key: 'professor', width: 20 },
    { header: 'SCHEDULE', key: 'schedule', width: 20 },
    { header: 'TOTAL ASSIGNMENTS', key: 'total', width: 18 },
    { header: 'COMPLETED', key: 'completed', width: 15 },
    { header: 'PERCENT COMPLETE', key: 'percent', width: 18 }
  ];
  
  // Style header row
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4B5563' }
  };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 25;
  
  // Add data rows
  classes.forEach((classItem) => {
    const classAssignments = assignments.filter(a => a.classId === classItem.id);
    const completed = classAssignments.filter(a => 
      a.status === 'Submitted' || a.status === 'Completed'
    ).length;
    const percentComplete = classAssignments.length > 0 
      ? ((completed / classAssignments.length) * 100).toFixed(1) 
      : '0';
    
    const row = worksheet.addRow({
      courseCode: classItem.courseCode,
      courseTitle: classItem.courseTitle,
      professor: classItem.instructor,
      schedule: classItem.schedule,
      total: classAssignments.length,
      completed: completed,
      percent: `${percentComplete}%`
    });
    
    // Determine row background color based on completion percentage
    const percentNum = parseFloat(percentComplete);
    let rowColor = 'FFFFFFFF'; // White
    if (percentNum === 100) {
      rowColor = 'FFBBF7D0'; // Green for 100%
    } else if (percentNum >= 75) {
      rowColor = 'FFFEF3C7'; // Yellow for 75%+
    } else if (percentNum >= 50) {
      rowColor = 'FFFED7AA'; // Orange for 50%+
    } else if (percentNum > 0) {
      rowColor = 'FFFEE2E2'; // Light red for <50%
    }
    
    row.eachCell((cell, colNumber) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: rowColor }
      };
      
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
      };
      
      cell.alignment = { vertical: 'middle' };
      
      // COURSE CODE column styling (col 1)
      if (colNumber === 1 && classItem.color) {
        const classColor = classItem.color.replace('#', '');
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF' + classColor }
        };
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      }
      
      // PERCENT COMPLETE column styling (col 7)
      if (colNumber === 7) {
        cell.font = { bold: true };
        if (percentNum === 100) {
          cell.font.color = { argb: 'FF16A34A' }; // Green
        } else if (percentNum < 50) {
          cell.font.color = { argb: 'FFDC2626' }; // Red
        }
      }
    });
    
    row.height = 20;
  });
  
  // Freeze header row
  worksheet.views = [
    { state: 'frozen', xSplit: 0, ySplit: 1 }
  ];
  
  // Generate file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `classes-summary-${getCurrentDate()}.xlsx`;
  link.click();
  
  URL.revokeObjectURL(url);
}

// Copy to Clipboard
export function copyToClipboard(assignments: Assignment[]) {
  const text = assignments.map(a => 
    `${a.className}\t${a.type}\t${a.title}\t${a.dueDate}\t${a.status}`
  ).join('\n');

  return navigator.clipboard.writeText(text);
}
