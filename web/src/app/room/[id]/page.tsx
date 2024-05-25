"use client";
import RoomNavBar from "@/components/common/RoomNavBar";
import UserChatBox from "@/components/user/UserChatBox";
import { ActiveRoomState, ActiveSocketState } from "@/store";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { io } from "socket.io-client";

export default function RoomAdminPerspective() {
  const { id } = useParams();

  const router = useRouter();

  const { data: session } = useSession();

  const [activeRoom, setActiveRoom] = useRecoilState(ActiveRoomState);
  const [socket, setActiveSocket] = useRecoilState(ActiveSocketState);

  useEffect(() => {
    if (session?.user?.role !== "USER") {
      router.push("/signin");
    }

    const getRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/${id}`);
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeRoom && session?.user?.email) {
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

  if (!session || !activeRoom) {
    return <></>;
  }

  return (
    <div className="h-screen w-full flex flex-col">
      <RoomNavBar session={session} room={activeRoom}></RoomNavBar>
      <div className="h-full mt-16 p-2 w-full flex justify-center">
        <div className="w-96 h-full">
          <UserChatBox></UserChatBox>
        </div>
      </div>
    </div>
  );
}
