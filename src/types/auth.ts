
import { AssigneeType } from "./index";

// We'll import UserRole from index.ts instead of redefining it
import { UserRole } from "./index";

export interface User {
  id: string;
  username?: string; // Make username optional to match Supabase User type
  password?: string; // This would be hashed in a real application
  role?: UserRole;
  isActive?: boolean;
  email?: string; // Add email field for Supabase compatibility
  assignee?: string | { id: string; username: string; role?: string }; // Match AssigneeType
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
  isEditor: boolean;
  isViewer: boolean;
  profile: any | null;
}
