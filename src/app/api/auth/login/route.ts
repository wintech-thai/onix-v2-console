/* eslint-disable  @typescript-eslint/no-explicit-any */
import { apiClient } from "@/lib/axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { COOKIE_NAMES, COOKIE_OPTIONS, TOKEN_EXPIRY } from "@/config/auth.config";

export async function POST(req: Request) {
  const body = await req.json();
  const cookiesStore = await cookies();

  const r = await apiClient.post("/api/Auth/org/temp/action/Login", body);

  if (r.status !== 200) {
    return NextResponse.json({
      success: false,
      message: r.data
    });
  }

  const accessToken = r.data.token.access_token;
  const refreshToken = r.data.token.refresh_token;
  const decodedToken = jwt.decode(accessToken) as { [key: string]: any } | null;
  const now = Date.now();

  // Set user_name cookie
  cookiesStore.set({
    name: COOKIE_NAMES.USER_NAME,
    value: decodedToken?.preferred_username,
    httpOnly: false,
    secure: COOKIE_OPTIONS.secure,
    sameSite: COOKIE_OPTIONS.sameSite,
  });

  // Set access_token cookie (15 minutes)
  cookiesStore.set({
    name: COOKIE_NAMES.ACCESS_TOKEN,
    value: accessToken,
    ...COOKIE_OPTIONS,
    expires: new Date(now + TOKEN_EXPIRY.ACCESS_TOKEN_MS),
  });

  // Set refresh_token cookie (60 days)
  cookiesStore.set({
    name: COOKIE_NAMES.REFRESH_TOKEN,
    value: String(refreshToken),
    ...COOKIE_OPTIONS,
    maxAge: TOKEN_EXPIRY.REFRESH_TOKEN_SECONDS,
  });

  return NextResponse.json({
    success: true,
    message: "success"
  });
}
