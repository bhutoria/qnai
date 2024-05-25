import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { accessKey } = await req.json();

  if (!accessKey) {
    return NextResponse.json(
      { message: "Access key not found" },
      { status: 400 }
    );
  }

  try {
    const data = await prisma.rooms.findUnique({ where: { accessKey } });
    if (!data) {
      return NextResponse.json(
        { message: "Invalid Access Key" },
        { status: 404 }
      );
    }
    return NextResponse.json({ id: data.id });
  } catch (e) {
    return NextResponse.json({}, { status: 500 });
  }
}
