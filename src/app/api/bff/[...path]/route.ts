import { cookies } from "next/headers";

const AUTH = process.env.NEXT_PUBLIC_API_URL!;
const API = process.env.NEXT_PUBLIC_API_URL!;

const REFRESH_TOKEN = "__Host-rt";
const ACCESS_TOKEN = "__Host-at";

type CacheEntry = { at: string; exp: number };
const AT_CACHE: Map<string, CacheEntry> =
  (globalThis as any).__AT_CACHE__ || new Map();
(globalThis as any).__AT_CACHE__ = AT_CACHE;

async function getAccessToken(rt: string): Promise<string | null> {
  const key = `rt:${rt}`;
  const now = Date.now();
  const cached = AT_CACHE.get(key);
  const cookie = await cookies();
  if (cached && cached.exp > now) return Buffer.from(cached.at, "utf-8").toString("base64");

  const r = await fetch(`${AUTH}/api/Auth/org/temp/action/Refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refreshToken: rt
    }),
    cache: "no-store",
  });

  if (r.status === 401) {
    cookie.delete(ACCESS_TOKEN);
    cookie.delete(REFRESH_TOKEN);
    AT_CACHE.delete(key);
    // Refresh token หมดอายุหรือไม่ valid
    return null;
  }

  if (!r.ok) {
    console.error(`Refresh failed with status ${r.status}:`, await r.text());
    return null;
  }

  const data = await r.json();
  const at = data.token.access_token as string;

  if (at) {
    cookie.set({
      name: "__Host-at",
      value: at,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      expires: new Date(now + data.token.expires_in * 1000),
    })
  }

  if (data.token.refresh_token) {
    cookie.set({
      name: "__Host-rt",
      value: String(data.token.refresh_token),
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });
  }

  AT_CACHE.set(key, { at, exp: now + 60_000 }); // cache 60 วินาที
  return Buffer.from(at, "utf-8").toString("base64")
}

async function proxy(req: Request, path: string[]) {
  const cookie = await cookies();
  const rt = cookie.get("__Host-rt")?.value;
  if (!rt) return new Response("Unauthorized", { status: 401 });

  // ขอ AT สด
  const at = await getAccessToken(rt);

  // ถ้า refresh token หมดอายุหรือไม่ valid
  if (!at) {
    cookie.delete(ACCESS_TOKEN);
    cookie.delete(REFRESH_TOKEN);
    AT_CACHE.delete(`rt:${rt}`);
    return new Response("Unauthorized - refresh token invalid", { status: 401 });
  }

  // target upstream
  const url = new URL(req.url);
  const target = `${API}/${path.join("/")}${url.search}`;
  console.log('target', target);

  // จัดระเบียบ headers: ตัดของ client ที่ไม่ควร forward
  const headers = new Headers(req.headers);
  headers.delete("authorization");
  headers.delete("cookie");
  headers.delete("host");
  headers.set("Authorization", `Bearer ${at}`);

  // (ออปชัน) บังคับ custom header เพื่อกัน CSRF สำหรับ methods ที่เปลี่ยน state
  const method = req.method.toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    if (headers.get("x-requested-with") !== "XMLHttpRequest") {
      return new Response("Bad Request", { status: 400 });
    }
  }

  const init: RequestInit = {
    method: req.method,
    headers,
    body:
      method === "GET" || method === "HEAD"
        ? undefined
        : await req.arrayBuffer(),
    cache: "no-store",
    redirect: "manual",
  };

  const upstream = await fetch(target, init);

  // ถ้า upstream ส่ง 401 กลับมา แสดงว่า access token หมดอายุ
  if (upstream.status === 401) {
    // ลบ cached access token
    AT_CACHE.delete(`rt:${rt}`);
    cookie.delete(ACCESS_TOKEN);
    cookie.delete(REFRESH_TOKEN);
    return new Response("Unauthorized - access token invalid", { status: 401 });
  }

  // ส่งต่อผลลัพธ์ (และกัน cache)
  const respHeaders = new Headers(upstream.headers);
  respHeaders.set("Cache-Control", "no-store");
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
