/* eslint-disable  @typescript-eslint/no-explicit-any */
import { apiClient } from "@/lib/axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

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
  const decodedToken = jwt.decode(accessToken) as { [key: string]: any } | null;

  cookiesStore.set({
    name: "user_name",
    value: decodedToken?.name || decodedToken?.email || "Anonymous",
    httpOnly: false,
    secure: true,
    sameSite: "strict",
  })

  cookiesStore.set({
    name: "refresh_token",
    value: String(r.data.token.refresh_token),
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });

  return NextResponse.json({
    success: true,
    message: "success"
  });
}
