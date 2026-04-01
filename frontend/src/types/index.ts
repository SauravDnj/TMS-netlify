export interface User {
  id: number;
  email: string;
  username: string;
  role: Role;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: string[];
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  userId: number;
  user: { id: number; username: string; email: string };
  assignedTo?: number;
  assignee?: { id: number; username: string; email: string };
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  completed: number;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  assignedTo?: number;
  dueDate?: string;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {}

export interface UserWithCount extends User {
  _count?: {
    tasks: number;
    assigned: number;
  };
  createdAt: string;
}

export interface RoleWithCount {
  id: number;
  name: string;
  description?: string;
  permissions: string[];
  userCount: number;
}
