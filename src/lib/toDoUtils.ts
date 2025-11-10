import { ToDoPriority } from "@/types/assignment";

export function getToDoPriorityColor(priority: ToDoPriority): string {
  const colorMap: Record<ToDoPriority, string> = {
    High: "bg-pastel-pink text-foreground",
    Low: "bg-pastel-lavender text-foreground",
  };
  return colorMap[priority];
}
