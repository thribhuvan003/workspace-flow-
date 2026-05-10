import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Webhooks are handled at /api/razorpay/webhook" }, { status: 410 });
}
