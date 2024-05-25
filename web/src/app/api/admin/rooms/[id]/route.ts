import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const id = req.url?.split("/").pop();
  try {
    const data = await prisma.rooms.findUnique({ where: { id } });
    if (!data) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }
    return NextResponse.json({ room: data });
  } catch (e) {
    return NextResponse.json({}, { status: 500 });
  }
}
