import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const AUTH = process.env.NEXT_PUBLIC_API_URL!;
const REFRESH_TOKEN = "refresh_token";
const ACCESS_TOKEN = "access_token";
const FIFTEEN_MIN_MS = 15 * 60 * 1000;

export async function POST() {
  const cookiesStore = await cookies();
  const rt = cookiesStore.get(REFRESH_TOKEN)?.value;

  if (!rt) {
    return NextResponse.json(
      { error: "No refresh token" },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(`${AUTH}/api/Auth/org/temp/action/Refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
      cache: "no-store",
    });

    if (response.status === 401) {
      // RT หมดอายุ - ลบ cookies
      cookiesStore.delete(ACCESS_TOKEN);
      cookiesStore.delete(REFRESH_TOKEN);
      return NextResponse.json(
        { error: "Refresh token expired" },
        { status: 401 }
      );
    }

    if (!response.ok) {
      console.error(`Refresh failed with status ${response.status}`);
      return NextResponse.json(
        { error: "Refresh failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const at = data?.token?.access_token as string | undefined;
    const newRt = data?.token?.refresh_token as string | undefined;

    if (!at) {
      return NextResponse.json(
        { error: "No access token in response" },
        { status: 500 }
      );
    }

    const now = Date.now();

    // Set access token cookie
    cookiesStore.set({
      name: ACCESS_TOKEN,
      value: at,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      expires: new Date(now + FIFTEEN_MIN_MS),
    });

    // Update refresh token if provided
    if (newRt) {
      cookiesStore.set({
        name: REFRESH_TOKEN,
        value: String(newRt),
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
