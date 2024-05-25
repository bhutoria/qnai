import { prisma } from "@/lib/db";

import { NextRequest, NextResponse } from "next/server";

const CACHE_MESSAGES = new Map<string, any[]>();
const CACHE_TIMEOUT = 1000 * 60 * 1;

setInterval(() => {
  CACHE_MESSAGES.clear();
}, CACHE_TIMEOUT);

export async function GET(req: NextRequest) {
  const id = req.url?.split("/").pop();

  if (!id) return NextResponse.json({}, { status: 401 });

  if (CACHE_MESSAGES.has(id)) {
    return NextResponse.json({ messages: CACHE_MESSAGES.get(id) });
  }

  try {
    const data = await prisma.chat.findMany({
      select: { message: true, user: { select: { name: true, role: true } } },
      where: { roomId: id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    if (!data) {
      return NextResponse.json({}, { status: 404 });
    }
    CACHE_MESSAGES.set(id, data.reverse());
    return NextResponse.json({ messages: data.reverse() });
  } catch (e) {
    return NextResponse.json({}, { status: 500 });
  }
}
