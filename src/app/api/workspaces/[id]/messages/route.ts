import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const sendSchema = z.object({
  content: z.string().trim().min(1).max(2000),
});

async function requireMember(userId: string, workspaceId: string) {
  return prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
}

// GET — full chat history, newest first paginated by `before`
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await requireMember(session.user.id, id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const before = url.searchParams.get("before");
  const take = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10), 100);

  const messages = await prisma.message.findMany({
    where: {
      workspaceId: id,
      ...(before ? { createdAt: { lt: new Date(before) } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  // return oldest → newest for UI
  return NextResponse.json(messages.reverse());
}

// POST — send a new message
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await requireMember(session.user.id, id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { content } = sendSchema.parse(await req.json());
    const message = await prisma.message.create({
      data: { workspaceId: id, userId: session.user.id, content },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });
    return NextResponse.json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
