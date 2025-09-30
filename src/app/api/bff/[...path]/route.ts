/* eslint-disable  @typescript-eslint/no-explicit-any */
import { cookies } from "next/headers";

const AUTH = process.env.NEXT_PUBLIC_API_URL!;
const API = process.env.NEXT_PUBLIC_API_URL!;

const REFRESH_TOKEN = "refresh_token";
const ACCESS_TOKEN = "access_token";
const FOUR_MIN_MS = 4 * 60 * 1000;

async function refreshAccessToken(rt: string): Promise<string | null> {
  const cookie = await cookies();

  const r = await fetch(`${AUTH}/api/Auth/org/temp/action/Refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: rt }),
    cache: "no-store",
  });

  if (r.status === 401) {
    // RT ใช้ไม่ได้แล้ว
    cookie.delete(ACCESS_TOKEN);
    cookie.delete(REFRESH_TOKEN);
    return null;
  }

  if (!r.ok) {
    console.error(`Refresh failed with status ${r.status}:`, await r.text());
    return null;
  }

  const data = await r.json();
  const at = data?.token?.access_token as string | undefined;
  const newRt = data?.token?.refresh_token as string | undefined;

  if (!at) return null;

  const now = Date.now();

  cookie.set({
    name: ACCESS_TOKEN,
    value: at,
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    expires: new Date(now + FOUR_MIN_MS),
  });

  // ถ้าได้ refresh_token ใหม่มาก็อัปเดตไว้
  if (newRt) {
    cookie.set({
      name: REFRESH_TOKEN,
      value: String(newRt),
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });
  }

  return at;
}

/**
 * ดึง AT จากคุกกี้ก่อน ถ้าไม่มีให้ใช้ RT ไปขอใหม่ (และตั้งคุกกี้ AT อายุ 4 นาที)
 */
async function ensureAccessToken(): Promise<string | null> {
  const cookie = await cookies();
  const at = cookie.get(ACCESS_TOKEN)?.value;
  if (at) return at;

  const rt = cookie.get(REFRESH_TOKEN)?.value;
  if (!rt) return null;

  return await refreshAccessToken(rt);
}

async function proxy(req: Request, path: string[]) {
  const cookie = await cookies();

  // เอา AT จากคุกกี้เป็นหลัก (อายุ 4 นาที), ถ้าไม่มีให้ refresh จาก RT
  const at = await ensureAccessToken();
  if (!at) {
    return new Response("Unauthorized", { status: 401 });
  }

  // target upstream
  const url = new URL(req.url);
  const target = `${API}/${path.join("/")}${url.search}`;
  // console.log('target', target);

  // เตรียม headers สำหรับส่งต่อ
  const headers = new Headers(req.headers);
  headers.delete("authorization");
  headers.delete("cookie");
  headers.delete("host");
  headers.delete("accept-encoding");
  headers.set("Authorization", `Bearer ${Buffer.from(at, "utf-8").toString("base64")}`);

  const method = req.method.toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    if (headers.get("x-requested-with") !== "XMLHttpRequest") {
      return new Response("Bad Request", { status: 400 });
    }
  }

  const init: RequestInit = {
    method: req.method,
    headers,
    body: method === "GET" || method === "HEAD" ? undefined : await req.arrayBuffer(),
    cache: "no-store",
    redirect: "manual",
  };

  // ยิงรอบแรก
  let upstream = await fetch(target, init);

  // ถ้าโดน 401 ให้ลอง refresh จาก RT แล้ว retry 1 ครั้ง
  if (upstream.status === 401) {
    cookie.delete(ACCESS_TOKEN); // ลบ AT เก่า
    const rt = cookie.get(REFRESH_TOKEN)?.value;
    if (rt) {
      const newAt = await refreshAccessToken(rt);
      if (newAt) {
        headers.set("Authorization", `Bearer ${newAt}`);
        upstream = await fetch(target, { ...init, headers });
      }
    }
  }

  if (upstream.status === 401) {
    // ยัง 401 อยู่หลังจาก retry
    return new Response("Unauthorized - access token invalid", { status: 401 });
  }

  // ส่งต่อผลลัพธ์ (กัน cache + เคลียร์ hop-by-hop)
  const respHeaders = new Headers(upstream.headers);
  respHeaders.set("Cache-Control", "no-store");
  respHeaders.delete("content-encoding");
  respHeaders.delete("content-length");
  respHeaders.delete("transfer-encoding");
  respHeaders.delete("connection");

  return new Response(upstream.body, {
    status: upstream.status,
    headers: respHeaders,
  });
}

export async function GET(req: Request, ctx: any) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
export async function POST(req: Request, ctx: any) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
export async function PUT(req: Request, ctx: any) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
export async function PATCH(req: Request, ctx: any) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
export async function DELETE(req: Request, ctx: any) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
