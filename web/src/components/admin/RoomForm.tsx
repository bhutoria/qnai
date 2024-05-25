import { useCallback, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";
import { useSetRecoilState } from "recoil";
import { AdminRoomsState } from "@/store";

export default function RoomForm() {
  const roomNameRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const setRooms = useSetRecoilState(AdminRoomsState);

  const onClick = useCallback(async () => {
    const roomName = roomNameRef.current?.value;
    if (roomName) {
      try {
        const response = await fetch("/api/admin/rooms/launch", {
          method: "POST",
          body: JSON.stringify({ roomName }),
        });
        if (!response.ok) throw new Error(response.statusText);
        const data = await response.json();
        setRooms((rooms) => [
          ...rooms,
          {
            accessKey: data.accessKey,
            createdAt: new Date(),
            id: data.roomId,
            name: roomName,
            userId: "",
            info: "",
          },
        ]);
      } catch (e) {
        console.log(e);
        return toast({
          title: "Uh oh! Something went wrong",
          variant: "destructive",
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white justify-center drop-shadow-lg rounded-lg p-10 flex flex-row items-end gap-4">
      <div>
        <label className="pl-2">Room Name</label>
        <Input
          className="w-72"
          maxLength={36}
          placeholder="Class Week 42"
          ref={roomNameRef}
        ></Input>
      </div>
      <Button
        variant={"outline"}
        className="bg-emerald-400 hover:bg-emerald-500"
        onClick={onClick}
      >
        Create
      </Button>
    </div>
  );
}
