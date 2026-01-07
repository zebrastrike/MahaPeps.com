import { NextResponse } from "next/server";

const API_BASE_URL = process.env.SERVER_API_BASE_URL || "http://localhost:3001";

export async function PATCH(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/mark-paid`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        // TODO: Add authentication headers
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
    console.error("Error marking order as paid:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
