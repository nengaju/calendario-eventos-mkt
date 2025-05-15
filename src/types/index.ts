
export type AssigneeType = "MARIANO" | "RUBENS" | "GIOVANNA" | "YAGO" | "JÚNIOR";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  assignee?: AssigneeType;
}

export interface Event {
  id: string;
  title: string;
  date: Date;
  description?: string;
  tasks: Task[];
  color?: string;
}
