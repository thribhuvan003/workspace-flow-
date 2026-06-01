"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

let socket: Socket | null = null;

export function useSocket(workspaceId: string | null) {
  const { data: session } = useSession();
  const user = session?.user;
  const initialized = useRef(false);

  useEffect(() => {
    if (!workspaceId || !user?.id || initialized.current) return;
    initialized.current = true;

    socket = io(process.env.NEXT_PUBLIC_APP_URL ?? "", {
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      socket?.emit("join-workspace", {
        workspaceId,
        userId: user.id,
        name: user.name,
        image: user.image,
      });
    });

    return () => {
      socket?.disconnect();
      socket = null;
      initialized.current = false;
    };
  }, [workspaceId, user]);

  const emit = useCallback((event: string, data: unknown) => {
    socket?.emit(event, data);
  }, []);

  const on = useCallback((event: string, handler: (...args: unknown[]) => void) => {
    socket?.on(event, handler);
    return () => { socket?.off(event, handler); };
  }, []);

  return { emit, on, socket };
}
