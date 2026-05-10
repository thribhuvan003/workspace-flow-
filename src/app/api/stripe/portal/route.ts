import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Billing is handled via Razorpay. Visit the billing page to manage your subscription." },
    { status: 410 }
  );
}
