
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { AssigneeType, CompanyType } from "@/types"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAssigneeColor(assignee: AssigneeType) {
  switch (assignee) {
    case "MARIANO":
      return "border-blue-200 bg-blue-50 text-blue-700"
    case "RUBENS":
      return "border-green-200 bg-green-50 text-green-700"
    case "GIOVANNA":
      return "border-purple-200 bg-purple-50 text-purple-700"
    case "YAGO":
      return "border-orange-200 bg-orange-50 text-orange-700"
    case "JÚNIOR":
      return "border-red-200 bg-red-50 text-red-700"
    default:
      return "border-gray-200 bg-gray-50 text-gray-700"
  }
}

export function getCompanyColor(company: CompanyType) {
  switch (company) {
    case "YATTA":
      return "#F0AD00" // Amarelo Trator
    case "FORBEL":
      return "#0040A8" // Azul Ford
    default:
      return "#6E6E6E" // Default gray
  }
}
