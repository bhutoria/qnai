import { useCallback, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";

export default function RoomAccessForm() {
  const accessKeyRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const onClick = useCallback(async () => {
    const accessKey = accessKeyRef.current?.value;
    if (accessKey) {
      try {
        const response = await fetch("/api/rooms", {
          method: "POST",
          body: JSON.stringify({ accessKey }),
        });
        if (!response.ok) throw new Error(response.statusText);
        const data = await response.json();
        if (!data.id) throw new Error("Unknown error");
        router.push(`/room/${data.id}`);
      } catch (e: any) {
        return toast({
          title: e.message,
          variant: "destructive",
        });
      }
    }
  }, [toast, router]);

  return (
    <div className="bg-white justify-center drop-shadow-lg rounded-lg p-10 flex flex-row items-end gap-4">
      <div>
        <label className="pl-2">Access Key</label>
        <Input
          className="w-72"
          maxLength={36}
          placeholder="Access Key"
          ref={accessKeyRef}
        ></Input>
      </div>
      <Button
        variant={"outline"}
        className="bg-emerald-400 hover:bg-emerald-500"
        onClick={onClick}
      >
        Join
      </Button>
    </div>
  );
}
