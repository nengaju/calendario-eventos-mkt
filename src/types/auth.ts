
import { AssigneeType } from "./index";

export type UserRole = "admin" | "user";

export interface User {
  id: string;
  username: string;
  password: string; // This would be hashed in a real application
  role: UserRole;
  assignee?: AssigneeType;
  isActive: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}
