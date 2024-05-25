"use client";
import { signOut } from "next-auth/react";
import { Button } from "../ui/button";
import { Session } from "next-auth";
import { Rooms } from "@prisma/client";
import { useRouter } from "next/navigation";

interface RoomNavBarProps {
  session: Session;
  room: Rooms;
}

export default function RoomNavBar({ session, room }: RoomNavBarProps) {
  const router = useRouter();

  return (
    <div className="h-16 w-full flex flex-row justify-between items-center bg-slate-200 px-4  fixed top-0 left-0">
      <div
        className="font-mono text-4xl text-white bg-black px-4 py-1 cursor-pointer"
        onClick={() => {
          router.push("/dashboard");
        }}
      >
        Q&ai
      </div>
      <div className="tracking-wider text-xl underline">{room.name}</div>
      <div className="flex items-center gap-4">
        <Button
          onClick={() => {
            signOut();
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
