"use client";
import { useToast } from "@/components/ui/use-toast";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function SignIn() {
  const router = useRouter();
  const { toast } = useToast();

  const emailRef = useRef<HTMLInputElement>(null);
  const accessKeyRef = useRef<HTMLInputElement>(null);

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
        Q&ai Admin
      </div>
      <input
        ref={emailRef}
        className="py-2 px-4 w-72 rounded-sm"
        type="text"
        placeholder="Email"
      ></input>
      <input
        ref={accessKeyRef}
        className="py-2 px-4 w-72 rounded-sm"
        type="password"
        placeholder="accessKey"
      ></input>
      <button
        onClick={async () => {
          const data = await signIn("credentials", {
            email: emailRef.current?.value,
            accessKey: accessKeyRef.current?.value,
            redirect: false,
          });
          if (data?.error) {
            toast({ title: "Invalid credentials.", variant: "destructive" });
          } else {
            router.push("/admin/dashboard");
          }
        }}
        className="flex items-center gap-4 text-2xl tracking-wider bg-slate-600 text-white rounded-md px-8 py-2"
      >
        Sign In
      </button>
    </div>
  );
}
