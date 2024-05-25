import { prisma } from "@/lib/db";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.JWT_SECRET });

  if (!token || !token.sub) {
    return NextResponse.json({}, { status: 401 });
  }

  const data = await req.json();

  if (!data) {
    return NextResponse.json({ message: "Invalid Fields" }, { status: 400 });
  }

  try {
    const room = await generateAccessKey(token.sub as string, data.roomName);
    if (!room) throw new Error("Error creating room");
    return NextResponse.json(room);
  } catch (e) {
    console.log(e);
    return NextResponse.json({}, { status: 500 });
  }
}

const generateAccessKey = (id: string, roomName: string) => {
  return prisma.$transaction(async (tx) => {
    const room = await tx.rooms.create({
      data: { userId: id, name: roomName },
    });

    let success = false;
    let accessKey: string;

    while (!success) {
      try {
        accessKey = getSixDigitKey();
        await tx.rooms.update({
          where: { id: room.id },
          data: { accessKey: accessKey },
        });
        success = true;
        return { roomId: room.id, accessKey };
      } catch (e) {
        throw e;
      }
    }
  });
};

const getSixDigitKey = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let accessKey = "";

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    accessKey += characters.charAt(randomIndex);
  }

  return accessKey;
};
