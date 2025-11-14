import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("mg_access_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { otherMemberId } = body;

    if (!otherMemberId) {
      return NextResponse.json(
        { error: "otherMemberId is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/chat/room/private/create?otherMemberId=${otherMemberId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to create private room" },
        { status: response.status }
      );
    }

    const roomId = await response.text();
    // UUID 문자열을 JSON으로 반환
    return NextResponse.json({ roomId: roomId.replace(/"/g, "") });
  } catch (error) {
    console.error("Failed to create private room:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

