import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  // Track online users per workspace
  const workspaceUsers = new Map<string, Map<string, { userId: string; name: string | null; image: string | null }>>();

  io.on("connection", (socket) => {
    let currentWorkspaceId: string | null = null;
    let currentUserId: string | null = null;

    socket.on("join-workspace", ({ workspaceId, userId, name, image }) => {
      currentWorkspaceId = workspaceId;
      currentUserId = userId;
      socket.join(`workspace:${workspaceId}`);

      if (!workspaceUsers.has(workspaceId)) {
        workspaceUsers.set(workspaceId, new Map());
      }
      workspaceUsers.get(workspaceId)!.set(socket.id, { userId, name, image });

      const onlineList = Array.from(workspaceUsers.get(workspaceId)!.values());
      io.to(`workspace:${workspaceId}`).emit("presence-update", onlineList);
    });

    socket.on("task-created", ({ workspaceId, task }) => {
      socket.to(`workspace:${workspaceId}`).emit("task-created", task);
    });

    socket.on("task-updated", ({ workspaceId, task }) => {
      socket.to(`workspace:${workspaceId}`).emit("task-updated", task);
    });

    socket.on("task-deleted", ({ workspaceId, taskId }) => {
      socket.to(`workspace:${workspaceId}`).emit("task-deleted", taskId);
    });

    socket.on("task-moved", ({ workspaceId, taskId, newStatus, newOrder }) => {
      socket.to(`workspace:${workspaceId}`).emit("task-moved", { taskId, newStatus, newOrder });
    });

    socket.on("comment-added", ({ workspaceId, taskId, comment }) => {
      socket.to(`workspace:${workspaceId}`).emit("comment-added", { taskId, comment });
    });

    socket.on("typing-start", ({ workspaceId, taskId, userId, name }) => {
      socket.to(`workspace:${workspaceId}`).emit("typing-start", { taskId, userId, name });
    });

    socket.on("typing-stop", ({ workspaceId, taskId, userId }) => {
      socket.to(`workspace:${workspaceId}`).emit("typing-stop", { taskId, userId });
    });

    socket.on("doc-updated", ({ workspaceId, docId, content }) => {
      socket.to(`workspace:${workspaceId}`).emit("doc-updated", { docId, content });
    });

    // ── Chat ────────────────────────────────────────────────
    socket.on("chat-message", ({ workspaceId, message }) => {
      // server-saved message is broadcast to everyone in the room (incl. sender)
      io.to(`workspace:${workspaceId}`).emit("chat-message", message);
    });

    socket.on("chat-typing-start", ({ workspaceId, userId, name }) => {
      socket.to(`workspace:${workspaceId}`).emit("chat-typing-start", { userId, name });
    });

    socket.on("chat-typing-stop", ({ workspaceId, userId }) => {
      socket.to(`workspace:${workspaceId}`).emit("chat-typing-stop", { userId });
    });

    socket.on("disconnect", () => {
      if (currentWorkspaceId && workspaceUsers.has(currentWorkspaceId)) {
        workspaceUsers.get(currentWorkspaceId)!.delete(socket.id);
        const onlineList = Array.from(workspaceUsers.get(currentWorkspaceId)!.values());
        io.to(`workspace:${currentWorkspaceId}`).emit("presence-update", onlineList);

        if (workspaceUsers.get(currentWorkspaceId)!.size === 0) {
          workspaceUsers.delete(currentWorkspaceId);
        }
      }
    });
  });

  const port = parseInt(process.env.PORT ?? "3000", 10);
  httpServer.listen(port, () => {
    console.log(`> WorkspaceFlow ready on http://localhost:${port}`);
  });
});
