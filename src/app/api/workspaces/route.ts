import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const createSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(300).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: session.user.id },
    include: {
      workspace: {
        include: {
          subscription: { select: { tier: true, status: true } },
          _count: { select: { tasks: true, members: true } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  const workspaces = memberships.map((m) => ({ ...m.workspace, role: m.role }));
  return NextResponse.json(workspaces);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, description, color, icon } = createSchema.parse(body);

    let slug = slugify(name);
    const existing = await prisma.workspace.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const workspace = await prisma.$transaction(async (tx: any) => {
      const ws = await tx.workspace.create({
        data: {
          name,
          slug,
          description,
          color: color ?? "#6366f1",
          icon,
          ownerId: session.user!.id!,
        },
      });

      await tx.workspaceMember.create({
        data: { userId: session.user!.id!, workspaceId: ws.id, role: "OWNER" },
      });

      await tx.subscription.create({
        data: { workspaceId: ws.id, tier: "FREE", status: "free" },
      });

      await tx.activity.create({
        data: {
          workspaceId: ws.id,
          userId: session.user!.id!,
          action: "created_workspace",
          details: { workspaceName: name },
        },
      });

      return ws;
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
