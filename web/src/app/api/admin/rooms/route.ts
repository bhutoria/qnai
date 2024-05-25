import { prisma } from "@/lib/db";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.JWT_SECRET });

  if (!token || !token.sub) {
    return NextResponse.json({}, { status: 401 });
  }

  try {
    const rooms = await prisma.rooms.findMany({ where: { userId: token.sub } });
    return NextResponse.json({ rooms });
  } catch (e) {
    console.log("Error getting rooms for:", token.id);
    console.log(e);
    return NextResponse.json({}, { status: 500 });
  }
}
