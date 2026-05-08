import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await params;

  const invite = await prisma.workspaceInvite.findUnique({
    where: { token },
    include: { workspace: true },
  });

  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invalid or expired invite" }, { status: 404 });
  }

  const alreadyMember = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId: invite.workspaceId } },
  });

  if (!alreadyMember) {
    await prisma.$transaction([
      prisma.workspaceMember.create({
        data: { userId: session.user.id, workspaceId: invite.workspaceId, role: invite.role },
      }),
      prisma.workspaceInvite.update({
        where: { token },
        data: { acceptedAt: new Date() },
      }),
      prisma.activity.create({
        data: {
          workspaceId: invite.workspaceId,
          userId: session.user.id,
          action: "joined_workspace",
          details: { via: "invite" },
        },
      }),
    ]);
  }

  return NextResponse.json({ slug: invite.workspace.slug });
}
