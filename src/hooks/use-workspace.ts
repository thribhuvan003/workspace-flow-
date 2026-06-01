"use client";

import { useState, useEffect, useCallback } from "react";
import { Task, WorkspaceMember, Activity } from "@/types";

export function useTasks(workspaceId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/tasks`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, setTasks, loading, refetch: fetchTasks };
}

export function useWorkspaceMembers(workspaceId: string) {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/workspaces/${workspaceId}/members`)
      .then((r) => r.json())
      .then((data) => setMembers(data))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  return { members, setMembers, loading };
}

export function useActivity(workspaceId: string) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/workspaces/${workspaceId}/activity`)
      .then((r) => r.json())
      .then((data) => setActivities(data))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  return { activities, loading };
}
