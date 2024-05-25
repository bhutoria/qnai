import { prisma } from "@/lib/db";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { id } = await req.json();

  if (!id) return NextResponse.json({}, { status: 400 });

  try {
    const data = await prisma.summary.findMany({
      where: { roomId: id },
      orderBy: { createdAt: "desc" },
    });

    if (!data) {
      return NextResponse.json({}, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (e) {
    return NextResponse.json({}, { status: 500 });
  }
}
