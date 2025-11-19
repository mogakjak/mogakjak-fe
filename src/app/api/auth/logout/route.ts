import { NextRequest, NextResponse } from "next/server";

const secure = process.env.NODE_ENV === "production";
const cookieOpts = {
  httpOnly: true,
  secure,
  sameSite: "lax" as const,
  path: "/",
};

function clearAll(res: NextResponse) {
  res.cookies.set("mg_access_token", "", { ...cookieOpts, maxAge: 0 });
  res.cookies.set("mg_refresh_token", "", { ...cookieOpts, maxAge: 0 });
}

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ success: true });
  clearAll(res);
  return res;
}
