import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, userId } = await params;
  const requester = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId: id } },
  });

  const isSelf = session.user.id === userId;
  if (!isSelf && (!requester || requester.role !== "OWNER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const target = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId: id } },
  });
  if (target?.role === "OWNER") {
    return NextResponse.json({ error: "Cannot remove workspace owner" }, { status: 400 });
  }

  await prisma.workspaceMember.delete({
    where: { userId_workspaceId: { userId, workspaceId: id } },
  });

  return NextResponse.json({ success: true });
}
