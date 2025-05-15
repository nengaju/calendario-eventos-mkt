
import { clsx, type ClassValue } from "clsx";
import { format, isToday } from "date-fns";
import { twMerge } from "tailwind-merge";

// Função utilitária para mesclar classes CSS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Função para formatar datas
export function formatDate(date: Date): string {
  return format(date, "dd/MM/yyyy");
}

// Função para formatar hora
export function formatTime(date: Date): string {
  return format(date, "HH:mm");
}

// Função para verificar se uma data é hoje
export function checkIfToday(date: Date): boolean {
  return isToday(date);
}

// Função para gerar um ID único
export function generateId(): string {
  return crypto.randomUUID();
}

// Função para formatar datas com base no contexto
export function formatDateDisplay(date: Date): string {
  if (isToday(date)) {
    return `Hoje, ${format(date, "HH:mm")}`;
  }
  return format(date, "dd/MM/yyyy HH:mm");
}

// Função para truncar texto
export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// Função para obter classe de cor do evento
export function getEventColorClass(color: string | undefined): string {
  switch (color) {
    case "blue":
      return "bg-kanban-blue";
    case "green":
      return "bg-kanban-green";
    case "purple":
      return "bg-kanban-purple";
    case "red":
      return "bg-kanban-red";
    case "orange":
      return "bg-kanban-orange";
    case "yellow":
      return "bg-kanban-yellow";
    case "teal":
      return "bg-kanban-teal";
    default:
      return "bg-gray-500";
  }
}

// Função para obter classe de cor do responsável
export function getAssigneeColor(assignee: string): string {
  switch (assignee) {
    case "MARIANO":
      return "border-blue-500 text-blue-500";
    case "RUBENS":
      return "border-green-500 text-green-500";
    case "GIOVANNA":
      return "border-purple-500 text-purple-500";
    case "YAGO":
      return "border-orange-500 text-orange-500";
    case "JÚNIOR":
      return "border-red-500 text-red-500";
    default:
      return "border-gray-500 text-gray-500";
  }
}
