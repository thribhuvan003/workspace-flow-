import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    priceINR: 0,
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
    price: 999,
    priceINR: 999,
    description: "For growing teams that need more power",
    features: [
      "Unlimited workspaces",
      "Unlimited members",
      "Unlimited tasks",
      "Advanced analytics & AI insights",
      "Priority support",
      "Custom labels & workflows",
      "Slack, GitHub & Discord integrations",
    ],
    limits: { workspaces: Infinity, members: Infinity, tasks: Infinity },
    amountInPaise: 99900,
  },
};
