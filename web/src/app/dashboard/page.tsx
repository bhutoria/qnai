"use client";
import NavBar from "@/components/common/NavBar";
import RoomAccessForm from "@/components/user/RoomAccessForm";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: session } = useSession();

  const router = useRouter();

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      return router.push("/admin/dashboard");
    }

    if (!session?.user) {
      router.push("/signin");
    }
  }, [session, router]);

  if (!session) {
    return;
  }

  return (
    <div className="h-screen w-full bg-slate-100">
      <NavBar session={session}></NavBar>
      <div className="flex flex-col justify-center mt-16 grow">
        <div className="flex items-center h-auto justify-center p-4">
          <RoomAccessForm></RoomAccessForm>
        </div>
      </div>
    </div>
  );
}
