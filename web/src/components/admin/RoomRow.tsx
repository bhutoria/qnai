import type { Rooms } from "@prisma/client";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

const RoomRow = ({ room }: { room: Rooms }) => {
  const router = useRouter();
  return (
    <div className="h-16 px-6 bg-white grid grid-cols-5 items-center">
      <div className="text-sm">
        {new Date(room.createdAt).toLocaleDateString()}
      </div>
      <div className="col-span-2">{room.name}</div>
      <div>{room.accessKey}</div>
      <Button
        variant={"outline"}
        className="hover:bg-emerald-300"
        onClick={() => {
          router.push(`/admin/room/${room.id}`);
        }}
      >
        Launch
      </Button>
    </div>
  );
};

export default RoomRow;
