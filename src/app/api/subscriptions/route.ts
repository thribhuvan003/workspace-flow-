import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, PLANS } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { workspaceId } = await req.json();

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

    let customerId = workspace.subscription?.stripeCustomerId;
    if (!customerId) {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      const customer = await stripe.customers.create({
        email: user?.email ?? undefined,
        name: user?.name ?? undefined,
        metadata: { workspaceId, userId: session.user.id },
      });
      customerId = customer.id;
      await prisma.subscription.upsert({
        where: { workspaceId },
        update: { stripeCustomerId: customerId },
        create: { workspaceId, stripeCustomerId: customerId, tier: "FREE", status: "free" },
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: PLANS.PRO.priceId!, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/workspace/${workspace.slug}?upgrade=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
      metadata: { workspaceId, userId: session.user.id },
      subscription_data: { metadata: { workspaceId } },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
