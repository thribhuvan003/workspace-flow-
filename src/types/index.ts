export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type MemberRole = "OWNER" | "MEMBER" | "GUEST";

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: MemberRole;
  joinedAt: string;
  user: User;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  members?: WorkspaceMember[];
  _count?: { tasks: number; members: number };
  subscription?: Subscription | null;
}

export interface Task {
  id: string;
  workspaceId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  dueDate: string | null;
  labels: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
  assignee?: User | null;
  comments?: TaskComment[];
  _count?: { comments: number };
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface Doc {
  id: string;
  workspaceId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  workspaceId: string;
  status: string;
  tier: string;
  currentPeriodEnd: string | null;
}

export interface Activity {
  id: string;
  workspaceId: string;
  userId: string;
  taskId: string | null;
  action: string;
  details: Record<string, unknown> | null;
  createdAt: string;
  user: User;
  task?: Task | null;
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
}

export interface SocketUser {
  userId: string;
  name: string | null;
  image: string | null;
  workspaceId: string;
}
