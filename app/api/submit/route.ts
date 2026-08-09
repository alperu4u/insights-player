import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const endpoint = process.env.GOOGLE_APPS_SCRIPT_URL?.trim();
  const token = process.env.GOOGLE_APPS_SCRIPT_TOKEN?.trim();
  if (!payload?.player?.name || !payload?.player?.email || !payload?.player?.consent || !payload?.answers) {
    return NextResponse.json({ stored: false, emailSent: false, error: "Missing required submission details." }, { status: 400 });
  }
  if (!endpoint || !token) {
    console.error("[api/submit] Google integration is not fully configured", {
      hasEndpoint: Boolean(endpoint),
      hasToken: Boolean(token),
    });
    return NextResponse.json({ stored: false, emailSent: false, error: "Submission service is not configured." }, { status: 503 });
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ...payload, integrationToken: token }),
      redirect: "follow",
    });
    const responseText = await response.text();

    if (!response.ok) {
      console.error("[api/submit] Google Apps Script HTTP failure", {
        status: response.status,
        contentType: response.headers.get("content-type"),
        responsePreview: responseText.slice(0, 300),
      });
      return NextResponse.json({ stored: false, emailSent: false, error: "Submission service could not be reached." }, { status: 502 });
    }

    let result: { ok?: boolean; error?: string; emailSent?: boolean; coachNotified?: boolean; id?: string } = {};
    try {
      result = JSON.parse(responseText);
    } catch {
      console.error("[api/submit] Google Apps Script returned a non-JSON response", {
        contentType: response.headers.get("content-type"),
        responsePreview: responseText.slice(0, 300),
      });
      return NextResponse.json({ stored: false, emailSent: false, error: "Submission service returned an invalid response." }, { status: 502 });
    }

    if (!result.ok) {
      console.error("[api/submit] Google Apps Script rejected submission", {
        error: result.error || "Unknown Apps Script error",
      });
      return NextResponse.json({ stored: false, emailSent: false, error: result.error || "Submission service rejected the request." }, { status: 502 });
    }

    console.log("[api/submit] Submission completed", {
      submissionId: result.id,
      emailSent: Boolean(result.emailSent),
      coachNotified: Boolean(result.coachNotified),
    });
    return NextResponse.json({ stored: true, emailSent: Boolean(result.emailSent), coachNotified: Boolean(result.coachNotified), submissionId: result.id });
  } catch (error) {
    console.error("[api/submit] Google Apps Script request failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ stored: false, emailSent: false, error: "Submission service request failed." }, { status: 502 });
  }
}
