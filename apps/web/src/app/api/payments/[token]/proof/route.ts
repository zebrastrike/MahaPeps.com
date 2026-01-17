import { NextResponse } from "next/server";

const API_BASE_URL = process.env.SERVER_API_BASE_URL || "http://localhost:3001";

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    // Get the form data from the request
    const formData = await request.formData();

    // Forward the form data to the backend
    const response = await fetch(`${API_BASE_URL}/payments/${params.token}/proof`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error uploading payment proof:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
