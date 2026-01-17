import { NextResponse } from "next/server";

const API_BASE_URL = process.env.SERVER_API_BASE_URL || "http://localhost:3001";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const body = await request.json();

    // Get client IP for audit logging
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    const response = await fetch(`${API_BASE_URL}/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
        "X-Forwarded-For": ip,
        "User-Agent": userAgent,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error processing checkout:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
