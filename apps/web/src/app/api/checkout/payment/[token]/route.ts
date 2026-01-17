import { NextResponse } from "next/server";

const API_BASE_URL = process.env.SERVER_API_BASE_URL || "http://localhost:3001";

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const response = await fetch(`${API_BASE_URL}/checkout/payment/${params.token}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching payment link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
