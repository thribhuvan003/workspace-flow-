import { NextResponse } from "next/server";

// Socket.io is initialized in the custom server (server.ts)
// This route just confirms it's active
export async function GET() {
  return NextResponse.json({ status: "Socket.io server running via custom server" });
}
