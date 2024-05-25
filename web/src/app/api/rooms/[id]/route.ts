import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  if (!id) return NextResponse.json({}, { status: 400 });
  try {
    const data = await prisma.rooms.findUnique({ where: { id } });
    if (!data) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }
    return NextResponse.json({ room: { name: data.name } });
  } catch (e) {
    return NextResponse.json({}, { status: 500 });
  }
}
