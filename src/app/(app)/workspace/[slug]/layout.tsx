import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkspaceSidebar } from "@/components/layout/workspace-sidebar";

interface Props {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function WorkspaceLayout({ children, params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { slug } = await params;

  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: {
      members: { select: { userId: true, role: true } },
      subscription: { select: { tier: true, status: true } },
      _count: { select: { tasks: true } },
    },
  });

  if (!workspace) notFound();

  const membership = workspace.members.find((m: { userId: string; role: string }) => m.userId === session.user!.id);
  if (!membership) notFound();

  const allMemberships = await prisma.workspaceMember.findMany({
    where: { userId: session.user.id },
    include: {
      workspace: {
        include: { subscription: { select: { tier: true, status: true } } },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allWorkspaces = allMemberships.map((m: any) => ({
    ...m.workspace,
    role: m.role,
    // Normalize dates to strings for client component prop compatibility
    createdAt: m.workspace.createdAt?.toISOString?.() ?? m.workspace.createdAt,
    updatedAt: m.workspace.updatedAt?.toISOString?.() ?? m.workspace.updatedAt,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const workspaceWithRole: any = {
    ...workspace,
    role: membership.role,
    createdAt: workspace.createdAt?.toISOString?.() ?? workspace.createdAt,
    updatedAt: workspace.updatedAt?.toISOString?.() ?? workspace.updatedAt,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0f]">
      <WorkspaceSidebar workspace={workspaceWithRole} allWorkspaces={allWorkspaces} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
