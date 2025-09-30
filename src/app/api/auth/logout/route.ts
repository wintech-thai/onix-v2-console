import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();

  // ลบ refresh token
  cookieStore.delete("refresh_token");
  cookieStore.delete("access_token");

  return NextResponse.json({ success: true });
}
