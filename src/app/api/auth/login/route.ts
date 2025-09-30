import { apiClient } from "@/lib/axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const r = await apiClient.post("/api/Auth/org/temp/action/Login", body);

  if (r.status !== 200) {
    return NextResponse.json({
      success: false,
      message: r.data
    });
  }

  (await cookies()).set({
    name: "__Host-rt",
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
