import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay, format } from "date-fns";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const access = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId: id } },
  });
  if (!access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);

  const [totalTasks, tasksByStatus, completedLast30, createdLast30, memberCount, recentActivities] =
    await Promise.all([
      prisma.task.count({ where: { workspaceId: id } }),
      prisma.task.groupBy({
        by: ["status"],
        where: { workspaceId: id },
        _count: { status: true },
      }),
      prisma.task.count({
        where: { workspaceId: id, status: "DONE", updatedAt: { gte: thirtyDaysAgo } },
      }),
      prisma.task.count({
        where: { workspaceId: id, createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.workspaceMember.count({ where: { workspaceId: id } }),
      prisma.activity.findMany({
        where: {
          workspaceId: id,
          action: "moved_task",
          createdAt: { gte: thirtyDaysAgo },
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

  // Build daily completed tasks chart data (last 14 days)
  const dailyData: { date: string; completed: number; created: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const dayStart = startOfDay(subDays(now, i));
    const dayEnd = startOfDay(subDays(now, i - 1));
    const [completed, created] = await Promise.all([
      prisma.task.count({
        where: { workspaceId: id, status: "DONE", updatedAt: { gte: dayStart, lt: dayEnd } },
      }),
      prisma.task.count({
        where: { workspaceId: id, createdAt: { gte: dayStart, lt: dayEnd } },
      }),
    ]);
    dailyData.push({ date: format(dayStart, "MMM d"), completed, created });
  }

  const priorityBreakdown = await prisma.task.groupBy({
    by: ["priority"],
    where: { workspaceId: id },
    _count: { priority: true },
  });

  return NextResponse.json({
    totalTasks,
    tasksByStatus: tasksByStatus.reduce(
      (acc: Record<string, number>, item) => ({ ...acc, [item.status]: item._count.status }),
      {} as Record<string, number>
    ),
    completedLast30,
    createdLast30,
    memberCount,
    completionRate:
      totalTasks > 0
        ? Math.round(
            ((tasksByStatus.find((t: { status: string; _count: { status: number } }) => t.status === "DONE")?._count.status ?? 0) / totalTasks) * 100
          )
        : 0,
    dailyData,
    priorityBreakdown: priorityBreakdown.reduce(
      (acc: Record<string, number>, item) => ({ ...acc, [item.priority]: item._count.priority }),
      {} as Record<string, number>
    ),
  });
}
