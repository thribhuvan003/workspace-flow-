import { prisma } from "./prisma";
import { auth } from "./auth";
import { redirect } from "next/navigation";

export async function getWorkspaceBySlug(slug: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
      },
      subscription: true,
      _count: { select: { tasks: true } },
    },
  });

  if (!workspace) return null;

  const membership = workspace.members.find((m) => m.userId === session.user!.id);
  if (!membership) return null;

  return { ...workspace, role: membership.role };
}

export async function getUserWorkspaces(userId: string) {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
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
  return memberships.map((m) => ({ ...m.workspace, role: m.role }));
}
