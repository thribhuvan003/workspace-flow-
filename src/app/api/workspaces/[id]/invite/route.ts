import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendInviteEmail } from "@/lib/email";
import { z } from "zod";
import { addDays } from "date-fns";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["MEMBER", "GUEST"]).default("MEMBER"),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const requester = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId: id } },
  });
  if (!requester || requester.role === "GUEST") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { email, role } = inviteSchema.parse(body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const alreadyMember = await prisma.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId: existingUser.id, workspaceId: id } },
      });
      if (alreadyMember) {
        return NextResponse.json({ error: "User is already a member" }, { status: 409 });
      }

      await prisma.workspaceMember.create({
        data: { userId: existingUser.id, workspaceId: id, role },
      });
      return NextResponse.json({ message: "Member added directly", immediate: true });
    }

    const invite = await prisma.workspaceInvite.upsert({
      where: { email_workspaceId: { email, workspaceId: id } },
      update: { role, expiresAt: addDays(new Date(), 7), acceptedAt: null },
      create: { email, workspaceId: id, role, expiresAt: addDays(new Date(), 7) },
    });

    const workspace = await prisma.workspace.findUnique({ where: { id }, select: { name: true } });
    const inviter = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true } });
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invite.token}`;

    let emailSent = false;
    try {
      await sendInviteEmail({
        to: email,
        inviterName: inviter?.name ?? inviter?.email ?? "A teammate",
        workspaceName: workspace?.name ?? "a workspace",
        inviteUrl,
        role,
      });
      emailSent = true;
    } catch (e) {
      console.error("[invite] email send failed:", e);
    }

    return NextResponse.json({
      message: emailSent ? "Invite sent" : "Invite created (email failed)",
      inviteToken: invite.token,
      inviteUrl,
      emailSent,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const access = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId: id } },
  });
  if (!access || access.role === "GUEST") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const invites = await prisma.workspaceInvite.findMany({
    where: { workspaceId: id, acceptedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(invites);
}
