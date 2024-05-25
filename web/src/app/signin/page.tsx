"use client";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignIn() {
  const router = useRouter();

  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      if (session.user.role === "ADMIN") {
        return router.push("/admin/dashboard");
      }
      router.push("/dashboard");
    }
  }, [session, router]);

  return (
    <div className="h-screen w-full bg-slate-200 flex items-center justify-center flex-col gap-10">
      <div className="text-4xl tracking-widest font-mono bg-black text-white py-2 px-4">
        Q&ai Sign In
      </div>
      <button
        onClick={async () => {
          await signIn("github");
        }}
        className="flex items-center gap-4 text-2xl tracking-wider bg-slate-600 text-white rounded-md px-8 py-2"
      >
        <Image
          src={"/github-mark.svg"}
          alt="GitHub"
          width={30}
          height={30}
        ></Image>
        Sign In with GitHub
      </button>
      <Link href={"/admin"}>Admin Login</Link>
    </div>
  );
}
