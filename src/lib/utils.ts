
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { AssigneeType } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getEventColorClass(color?: string): string {
  switch (color) {
    case 'green':
      return 'bg-kanban-green';
    case 'red':
      return 'bg-kanban-red';
    case 'purple':
      return 'bg-kanban-purple';
    case 'orange':
      return 'bg-kanban-orange';
    case 'yellow':
      return 'bg-kanban-yellow';
    case 'teal':
      return 'bg-kanban-teal';
    case 'blue':
    default:
      return 'bg-kanban-blue';
  }
}

export function getAssigneeColor(assignee: AssigneeType): string {
  switch (assignee) {
    case 'MARIANO':
      return 'text-kanban-blue border-kanban-blue';
    case 'RUBENS':
      return 'text-kanban-green border-kanban-green';
    case 'GIOVANNA':
      return 'text-kanban-purple border-kanban-purple';
    case 'YAGO':
      return 'text-kanban-orange border-kanban-orange';
    case 'JÚNIOR':
      return 'text-kanban-red border-kanban-red';
    default:
      return 'text-gray-500 border-gray-500';
  }
}
