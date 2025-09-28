import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();

  // ลบ refresh token
  cookieStore.delete("__Host-rt");
  cookieStore.delete("__Host-at");

  return NextResponse.json({ success: true });
}
