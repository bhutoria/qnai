"use client";
import type { Rooms } from "@prisma/client";
import { useEffect, useState } from "react";
import { useToast } from "../ui/use-toast";
import RoomRow from "./RoomRow";
import { useRecoilState } from "recoil";
import { AdminRoomsState } from "@/store";
import { useRouter } from "next/navigation";

type RoomsList = Rooms[];

const RoomsList = () => {
  const { toast } = useToast();

  const [rooms, setRooms] = useRecoilState(AdminRoomsState);

  useEffect(() => {
    const getRooms = async () => {
      try {
        const response = await fetch("/api/admin/rooms");
        const data = await response.json();
        setRooms(data.rooms);
      } catch (e) {
        console.log(e);
        return toast({
          title: "Uh oh! Something went wrong.",
          variant: "destructive",
        });
      }
    };
    getRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-full p-2 tracking-widest">
      <div className="w-full rounded-lg drop-shadow-lg flex flex-col items-center">
        <div className="h-16 px-6 bg-white border-b-2 border-slate-200 rounded-t-lg grid grid-cols-5 items-center text-md font-semibold sm:w-[600px]">
          <div>Date</div>
          <div className="col-span-2">Room Name</div>
          <div>Access Key</div>
          <div></div>
        </div>
        <div className="overflow-x-hidden sm:w-[600px] overflow-y-auto grow max-h-96 rounded-b-lg">
          {rooms?.map((room) => (
            <RoomRow key={room.id} room={room}></RoomRow>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoomsList;
