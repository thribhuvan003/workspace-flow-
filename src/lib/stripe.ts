import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
  typescript: true,
});

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    description: "Perfect for individuals and small projects",
    features: [
      "1 workspace",
      "Up to 3 members",
      "100 tasks",
      "Basic analytics",
      "Community support",
    ],
    limits: { workspaces: 1, members: 3, tasks: 100 },
  },
  PRO: {
    name: "Pro",
    price: 12,
    description: "For growing teams that need more power",
    features: [
      "Unlimited workspaces",
      "Unlimited members",
      "Unlimited tasks",
      "Advanced analytics",
      "Priority support",
      "Custom labels & workflows",
      "File attachments",
    ],
    limits: { workspaces: Infinity, members: Infinity, tasks: Infinity },
    priceId: process.env.STRIPE_PRO_PRICE_ID,
  },
};
