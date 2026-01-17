import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.SERVER_API_BASE_URL || "http://localhost:3001";

export async function POST(
  request: Request,
  { params }: { params: { paymentId: string } }
) {
  try {
    // Get token from cookie or header
    const cookieStore = cookies();
    const tokenCookie = cookieStore.get("token");
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "") || tokenCookie?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/admin/payments/${params.paymentId}/reject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
    console.error("Error rejecting payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
