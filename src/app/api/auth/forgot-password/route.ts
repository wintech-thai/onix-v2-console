import { apiClient } from "@/lib/axios";
import { NextResponse } from "next/server";

export async function POST(reqest: Request) {
  const body = await reqest.json();

  const res = await apiClient.post<{
    status: string;
    description: string;
  }>(`/api/Auth/org/temp/action/SendForgotPasswordEmail/${body.email}`);

  return NextResponse.json(res.data);
}
