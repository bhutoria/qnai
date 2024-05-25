import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.JWT_SECRET });

  if (!token || !token.sub) {
    return NextResponse.json({}, { status: 401 });
  }

  try {
    const data = await fetch(`${req.url.split("/api")[0]}/api/whoami`, {
      method: "POST",
      body: JSON.stringify({ id: token.sub }),
    });
    const resp = await data.json();
    if (resp.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  } catch (e) {
    console.log(e);
    return NextResponse.json({}, { status: 500 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
