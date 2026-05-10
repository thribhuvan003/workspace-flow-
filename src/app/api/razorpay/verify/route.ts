import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { orderId, paymentId, signature, workspaceId } = await req.json();

    if (!orderId || !paymentId || !signature || !workspaceId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
    });
    if (!membership || membership.role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const generated = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (generated !== signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await prisma.subscription.upsert({
      where: { workspaceId },
      update: {
        razorpayPaymentId: paymentId,
        status: "active",
        tier: "PRO",
        currentPeriodEnd: periodEnd,
      },
      create: {
        workspaceId,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        status: "active",
        tier: "PRO",
        currentPeriodEnd: periodEnd,
      },
    });

    await prisma.activity.create({
      data: {
        workspaceId,
        userId: session.user.id,
        action: "upgraded_to_pro",
        details: { paymentId, plan: "PRO" },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
