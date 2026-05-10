import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { geminiPro } from "@/lib/gemini";

async function checkAccess(userId: string, workspaceId: string) {
  return prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const access = await checkAccess(session.user.id, id);
  if (!access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { type = "workspace" } = await req.json().catch(() => ({}));

  const [tasks, docs, members, recentActivity] = await Promise.all([
    prisma.task.findMany({
      where: { workspaceId: id },
      include: { assignee: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
    prisma.doc.findMany({
      where: { workspaceId: id },
      select: { title: true, content: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
    prisma.workspaceMember.findMany({
      where: { workspaceId: id },
      include: { user: { select: { name: true } } },
    }),
    prisma.activity.findMany({
      where: { workspaceId: id },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "TODO").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    review: tasks.filter((t) => t.status === "REVIEW").length,
    done: tasks.filter((t) => t.status === "DONE").length,
    urgent: tasks.filter((t) => t.priority === "URGENT").length,
    high: tasks.filter((t) => t.priority === "HIGH").length,
    overdue: tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE").length,
  };

  const taskList = tasks
    .slice(0, 20)
    .map((t) => `- [${t.status}] ${t.title} (${t.priority}${t.assignee ? `, assigned to ${t.assignee.name}` : ""})`)
    .join("\n");

  const activityList = recentActivity
    .slice(0, 10)
    .map((a) => `- ${a.user.name}: ${a.action}`)
    .join("\n");

  let prompt = "";

  if (type === "workspace") {
    prompt = `You are an expert project manager analyzing a workspace in WorkspaceFlow. Generate a concise, insightful summary for the team.

Workspace data:
- ${members.length} team member(s)
- Task statistics: ${taskStats.total} total tasks | ${taskStats.todo} TODO | ${taskStats.inProgress} in progress | ${taskStats.review} in review | ${taskStats.done} done
- ${taskStats.urgent} urgent tasks | ${taskStats.high} high priority tasks | ${taskStats.overdue} overdue tasks
- ${docs.length} documentation pages

Recent tasks:
${taskList}

Recent activity:
${activityList}

Write a 3-4 paragraph executive summary covering:
1. Current project health and progress overview
2. Key blockers, risks, or items needing attention (especially overdue/urgent tasks)
3. Team velocity and recent highlights
4. Recommended next steps or focus areas

Use markdown formatting. Be specific, data-driven, and actionable. Avoid generic filler sentences.`;
  } else if (type === "standup") {
    prompt = `Generate a daily standup summary for a development team using WorkspaceFlow.

Task data:
- In progress (${taskStats.inProgress}): ${tasks.filter((t) => t.status === "IN_PROGRESS").slice(0, 10).map((t) => t.title).join(", ")}
- Completed recently (${taskStats.done}): ${tasks.filter((t) => t.status === "DONE").slice(0, 10).map((t) => t.title).join(", ")}
- Blocked/overdue (${taskStats.overdue}): ${tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE").slice(0, 5).map((t) => t.title).join(", ")}

Recent activity:
${activityList}

Generate a brief standup summary with three sections: **Yesterday**, **Today**, and **Blockers**. Keep it concise and team-ready. Use markdown.`;
  } else {
    prompt = `Analyze the task backlog for a team using WorkspaceFlow and provide prioritization recommendations.

Task data:
${taskList}

Statistics: ${taskStats.urgent} urgent | ${taskStats.high} high | ${taskStats.overdue} overdue | ${taskStats.inProgress} in progress

Provide:
1. **Critical items** (must address immediately)
2. **High-value quick wins** (can complete soon)
3. **Strategic recommendations** for the backlog

Use markdown. Be specific and actionable.`;
  }

  try {
    const result = await geminiPro.generateContent(prompt);
    const text = result.response.text();

    await prisma.aiSummary.create({
      data: { workspaceId: id, type, content: text },
    });

    return NextResponse.json({ summary: text, type });
  } catch (err) {
    console.error("AI summary error:", err);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const access = await checkAccess(session.user.id, id);
  if (!access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const summaries = await prisma.aiSummary.findMany({
    where: { workspaceId: id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json(summaries);
}
