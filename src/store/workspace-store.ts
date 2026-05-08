import { create } from "zustand";
import { Task, Workspace } from "@/types";

interface WorkspaceStore {
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;

  onlineUsers: string[];
  setOnlineUsers: (users: string[]) => void;

  workspaces: Workspace[];
  setWorkspaces: (workspaces: Workspace[]) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  selectedTask: null,
  setSelectedTask: (task) => set({ selectedTask: task }),

  onlineUsers: [],
  setOnlineUsers: (users) => set({ onlineUsers: users }),

  workspaces: [],
  setWorkspaces: (workspaces) => set({ workspaces }),
}));
