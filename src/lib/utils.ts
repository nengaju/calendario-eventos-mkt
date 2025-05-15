
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
      return "bg-blue-500";
    case "green":
      return "bg-green-500";
    case "purple":
      return "bg-purple-500";
    case "red":
      return "bg-red-500";
    case "orange":
      return "bg-orange-500";
    case "yellow":
      return "bg-yellow-500";
    case "teal":
      return "bg-teal-500";
    default:
      return "bg-gray-500";
  }
}
