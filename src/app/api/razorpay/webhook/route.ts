import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const digest = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");

  if (digest !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { event: string; payload: Record<string, unknown> };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    if (event.event === "payment.captured") {
      const payment = (event.payload as { payment?: { entity?: Record<string, unknown> } })?.payment?.entity;
      if (!payment) return NextResponse.json({ received: true });

      const workspaceId = (payment.notes as Record<string, string>)?.workspaceId;
      const paymentId = payment.id as string;
      if (!workspaceId) return NextResponse.json({ received: true });

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
          razorpayPaymentId: paymentId,
          status: "active",
          tier: "PRO",
          currentPeriodEnd: periodEnd,
        },
      });
    }

    if (event.event === "subscription.cancelled") {
      const subscription = (event.payload as { subscription?: { entity?: Record<string, unknown> } })?.subscription?.entity;
      if (!subscription) return NextResponse.json({ received: true });

      const workspaceId = (subscription.notes as Record<string, string>)?.workspaceId;
      if (!workspaceId) return NextResponse.json({ received: true });

      await prisma.subscription.update({
        where: { workspaceId },
        data: { status: "canceled", tier: "FREE" },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
