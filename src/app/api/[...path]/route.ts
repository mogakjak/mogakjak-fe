import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_PROXY;

function buildTargetUrl(path: string[] | undefined, req: NextRequest) {
  const joined = (path ?? []).join("/");
  const search = req.nextUrl.search || "";
  return `${API_BASE}/api/${joined}${search}`;
}

async function proxy(
  method: string,
  req: NextRequest,
  path: string[] | undefined
) {
  const token = req.cookies.get("mg_access_token")?.value ?? null;
  const url = buildTargetUrl(path, req);

  if (url.startsWith(`${req.nextUrl.origin}/api/`)) {
    return NextResponse.json({ message: "Bad proxy config" }, { status: 500 });
  }

  const headers = new Headers(req.headers);
  headers.set("accept", "application/json");
  if (!headers.has("content-type") && method !== "GET" && method !== "HEAD") {
    headers.set("content-type", "application/json");
  }
  headers.delete("host");
  headers.delete("content-length");
  if (token) headers.set("authorization", `Bearer ${token}`);

  const hasBody = !(method === "GET" || method === "HEAD");
  const body = hasBody ? await req.text() : undefined;

  const upstream = await fetch(url, {
    method,
    headers,
    body,
    cache: "no-store",
  });
  const text = await upstream.text();
  const contentType =
    upstream.headers.get("content-type") ?? "application/json";
  const resp = new NextResponse(text, {
    status: upstream.status,
    headers: { "content-type": contentType },
  });

  resp.headers.set("x-proxy-hit", "true");
  resp.headers.set("x-proxy-url", url);
  resp.headers.set("x-proxy-auth", token ? "present" : "missing");
  return resp;
}

type Ctx = { params: Promise<{ path?: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy("GET", req, path);
}
export async function POST(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy("POST", req, path);
}
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy("PATCH", req, path);
}
export async function PUT(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy("PUT", req, path);
}
export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy("DELETE", req, path);
}
