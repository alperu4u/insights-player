import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const endpoint = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!payload?.player?.name || !payload?.player?.email || !payload?.player?.consent || !payload?.answers) {
    return NextResponse.json({ stored: false, emailSent: false, error: "Missing required submission details." }, { status: 400 });
  }
  if (!endpoint) return NextResponse.json({ stored: false, emailSent: false, mode: "demo" });
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ ...payload, integrationToken: process.env.GOOGLE_APPS_SCRIPT_TOKEN || "" }),
  });
  if (!response.ok) return NextResponse.json({ stored: false, emailSent: false }, { status: 502 });
  const result = await response.json().catch(() => ({}));
  if (!result.ok) return NextResponse.json({ stored: false, emailSent: false, error: "Submission service rejected the request." }, { status: 502 });
  return NextResponse.json({ stored: true, emailSent: Boolean(result.emailSent), coachNotified: Boolean(result.coachNotified), submissionId: result.id });
}
