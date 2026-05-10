import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/anthropic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const access = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId: id } },
  });
  if (!access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, priority = "MEDIUM", labels = [] } = await req.json();
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });

  const prompt = `You are a professional software project manager. Write a clear, concise task description for the following task.

Task title: "${title}"
Priority: ${priority}
Labels: ${labels.length ? labels.join(", ") : "none"}

Write a 2-4 sentence description that includes:
1. What needs to be done (the objective)
2. Any technical context or acceptance criteria
3. The expected outcome

Keep it professional and actionable. Do not use bullet points or markdown headers — write as clean prose. Do not repeat the task title.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected type");

    return NextResponse.json({ description: content.text.trim() });
  } catch (err) {
    console.error("AI task description error:", err);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
