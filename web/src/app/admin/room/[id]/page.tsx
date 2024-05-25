"use client";

import AISummary from "@/components/admin/AISummary";
import AdminChatBox from "@/components/admin/AdminChatBox";
import MemberCount from "@/components/common/MemberCount";
import RoomNavBar from "@/components/common/RoomNavBar";
import {
  ActiveRoomState,
  ActiveSocketState,
  MessagesState,
  SummaryState,
} from "@/store";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useRecoilState, useResetRecoilState } from "recoil";
import { io } from "socket.io-client";

export default function RoomAdminPerspective() {
  const { id } = useParams();

  const router = useRouter();

  const { data: session } = useSession();

  const [activeRoom, setActiveRoom] = useRecoilState(ActiveRoomState);
  const [socket, setActiveSocket] = useRecoilState(ActiveSocketState);

  const resetSummary = useResetRecoilState(SummaryState);
  const resetChat = useResetRecoilState(MessagesState);

  useEffect(() => {
    const getRoom = async () => {
      try {
        const response = await fetch(`/api/admin/rooms/${id}`);
        if (!response.ok) {
          router.push("/dashboard");
          return;
        }
        const data = await response.json();
        setActiveRoom(data.room);
      } catch (e) {
        console.log(e);
      }
    };
    getRoom();

    return () => {
      setActiveRoom(null);
      resetSummary();
      resetChat();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeRoom && session?.user?.id) {
      const socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER!, {
        query: { room: id, user: session.user.id },
        autoConnect: false,
      });
      setActiveSocket(socket);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRoom]);

  useEffect(() => {
    if (socket) {
      socket.connect();
    }
    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  if (!session || !activeRoom || Array.isArray(id)) {
    return <></>;
  }

  return (
    <div className="h-screen w-full flex flex-col">
      <RoomNavBar session={session} room={activeRoom}></RoomNavBar>
      <div className="h-full mt-16 p-2 grid grid-cols-2">
        <AdminChatBox></AdminChatBox>
        <div className="h-full w-full p-2 flex flex-col">
          <div className="flex flex-row justify-between font-mono py-4 px-2 items-center">
            <div>
              <span className="bg-slate-100 p-2 border-2 border-slate-100 rounded-l-md">
                Access Key
              </span>
              <span className="p-2 rounded-r-md border-2 border-slate-100">
                {activeRoom.accessKey}
              </span>
            </div>
            <div>
              <MemberCount></MemberCount>
            </div>
          </div>
          <div className="grow">
            <AISummary id={id}></AISummary>
          </div>
        </div>
      </div>
    </div>
  );
}
