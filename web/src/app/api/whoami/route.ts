import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // const token = await getToken({ req, secret: process.env.JWT_SECRET });
  const data = await req.json();

  if (!data.id) {
    console.log("id not found");
    return NextResponse.json({});
  }
  try {
    const resp = await prisma.users.findUnique({
      where: { id: data.id as string },
    });
    if (!resp) throw new Error("Can't find user");
    return NextResponse.json({
      name: resp.name,
      email: resp.email,
      role: resp.role,
    });
  } catch (e) {
    return NextResponse.json({}, { status: 500 });
  }
}
