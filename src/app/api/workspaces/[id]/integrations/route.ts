import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

async function checkOwnerAccess(userId: string, workspaceId: string) {
  return prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const access = await checkOwnerAccess(session.user.id, id);
  if (!access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const integrations = await prisma.integration.findMany({
    where: { workspaceId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(integrations);
}

const INTEGRATION_TYPES = ["SLACK", "GITHUB", "DISCORD"] as const;

const upsertSchema = z.object({
  type: z.enum(INTEGRATION_TYPES),
  enabled: z.boolean().optional(),
  accessToken: z.string().optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const access = await checkOwnerAccess(session.user.id, id);
  if (!access || access.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden — only owners can manage integrations" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { type, enabled, accessToken, metadata } = upsertSchema.parse(body);

    const metadataJson = metadata ? (metadata as Prisma.InputJsonValue) : undefined;

    const integration = await prisma.integration.upsert({
      where: { workspaceId_type: { workspaceId: id, type } },
      update: {
        enabled: enabled ?? true,
        ...(accessToken !== undefined ? { accessToken } : {}),
        ...(metadataJson !== undefined ? { metadata: metadataJson } : {}),
      },
      create: {
        workspaceId: id,
        type,
        enabled: enabled ?? true,
        ...(accessToken ? { accessToken } : {}),
        ...(metadataJson ? { metadata: metadataJson } : {}),
      },
    });

    await prisma.activity.create({
      data: {
        workspaceId: id,
        userId: session.user.id,
        action: enabled === false ? "disabled_integration" : "enabled_integration",
        details: { type } as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json(integration);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const access = await checkOwnerAccess(session.user.id, id);
  if (!access || access.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { type } = await req.json();
  await prisma.integration.deleteMany({ where: { workspaceId: id, type } });
  return NextResponse.json({ success: true });
}
