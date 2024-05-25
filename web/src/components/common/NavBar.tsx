"use client";
import { signOut } from "next-auth/react";
import { Button } from "../ui/button";
import { Session } from "next-auth";

interface NavBarProps {
  session: Session;
}

export default function NavBar({ session }: NavBarProps) {
  return (
    <div className="h-16 w-full flex flex-row justify-between items-center bg-slate-200 px-4  fixed top-0 left-0">
      <div className="font-mono text-4xl text-white bg-black px-4 py-1">
        Q&ai
      </div>
      <div className="flex items-center gap-4">
        <span>{session?.user?.name}</span>
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
