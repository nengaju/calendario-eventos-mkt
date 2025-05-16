
export type AssigneeType = string;
export type CompanyType = "YATTA" | "FORBEL";
export type UserRole = "admin" | "editor" | "viewer";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  assignees?: AssigneeType[];
  editable?: boolean;
}

export interface Event {
  id: string;
  title: string;
  date: Date;
  description?: string;
  tasks: Task[];
  color?: string;
  company?: CompanyType;
}

export interface Profile {
  id: string;
  username: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface TaskAssignee {
  id: string;
  task_id: string;
  user_id: string;
  created_at?: string;
}
