"use client";
import NavBar from "@/components/common/NavBar";
import RoomForm from "@/components/admin/RoomForm";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import RoomsList from "@/components/admin/RoomsList";

export default function AdminDashboard() {
  const { data: session } = useSession();

  const router = useRouter();

  useEffect(() => {
    if (!session?.user) {
      router.push("/admin");
    }
  }, [session, router]);

  if (!session) {
    return;
  }

  return (
    <div className="h-screen w-full flex flex-col bg-slate-100">
      <NavBar session={session}></NavBar>
      <div className="flex flex-col justify-center mt-16 grow">
        <div className="flex items-center h-auto justify-center p-4">
          <RoomForm></RoomForm>
        </div>
        <div className="grow">
          <RoomsList></RoomsList>
        </div>
      </div>
    </div>
  );
}
