/* eslint-disable  @typescript-eslint/no-explicit-any */
import { cookies } from "next/headers";

const API = process.env.NEXT_PUBLIC_API_URL!;

const ACCESS_TOKEN = "access_token";

/**
 * ดึง AT จากคุกกี้ (ไม่ refresh ที่นี่ - ให้ client จัดการ)
 */
async function ensureAccessToken(): Promise<string | null> {
  const cookie = await cookies();
  return cookie.get(ACCESS_TOKEN)?.value || null;
}

async function proxy(req: Request, path: string[]) {
  // 🔴 TEMPORARY: Force 403 for testing permission error handling
  // TODO: Remove this after testing
  // return new Response(
  //   JSON.stringify({
  //     code: "FORBIDDEN",
  //     message: "You do not have permission to access this resource"
  //   }),
  //   {
  //     status: 403,
  //     headers: { "Content-Type": "application/json" }
  //   }
  // );

  // เอา AT จากคุกกี้ (ถ้าไม่มีจะได้ 401 กลับไป)
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

  let body: any = undefined;
  if (!["GET", "HEAD"].includes(method)) {
    const textBody = await req.text();
    if (textBody) {
      try {
        const jsonBody = JSON.parse(textBody);
        body = JSON.stringify(jsonBody);
        headers.set("Content-Type", "application/json");
      } catch {
        body = textBody;
      }
    }
  }

  const init: RequestInit = {
    method: req.method,
    headers,
    body,
    cache: "no-store",
    redirect: "manual",
  };

  // ยิงรอบแรก
  const upstream = await fetch(target, init);

  // ถ้าโดน 401 ส่งกลับไปให้ client จัดการ refresh เอง
  // ไม่ต้อง retry ที่นี่
  if (upstream.status === 401) {
    return new Response("Unauthorized", { status: 401 });
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
