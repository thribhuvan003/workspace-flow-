import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { razorpay, PLANS } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { workspaceId } = await req.json();
    if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

    const membership = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
    });
    if (!membership || membership.role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { subscription: true },
    });
    if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (workspace.subscription?.tier === "PRO" && workspace.subscription?.status === "active") {
      return NextResponse.json({ error: "Already on Pro plan" }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: PLANS.PRO.amountInPaise,
      currency: "INR",
      receipt: `wsf_${workspaceId.slice(-8)}_${Date.now()}`,
      notes: {
        workspaceId,
        userId: session.user.id,
        plan: "PRO",
      },
    });

    await prisma.subscription.upsert({
      where: { workspaceId },
      update: { razorpayOrderId: order.id },
      create: {
        workspaceId,
        razorpayOrderId: order.id,
        tier: "FREE",
        status: "pending",
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: PLANS.PRO.amountInPaise,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay order error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
