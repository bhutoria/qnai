import { ActiveSocketState, MessagesState } from "@/store";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import MessageBubble from "./MessageBubble";
import { useParams } from "next/navigation";

const MessagesArea = () => {
  const { id } = useParams<{ id: string }>();

  const socket = useRecoilValue(ActiveSocketState);
  const [messages, setMessages] = useRecoilState(MessagesState);
  const [adminFilter, setAdminFilter] = useState(false);

  useEffect(() => {
    const getMessages = async () => {
      const response = await fetch(`/api/messages/${id}`);
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      if (!data || !data.messages) return;
      setMessages(
        data.messages.map(
          (m: { message: string; user: { name: string; role: string } }) => ({
            message: m.message,
            name: m.user.name,
            role: m.user.role,
          })
        )
      );
      if (divRef.current) {
        divRef.current.scrollTop = divRef.current.scrollHeight;
      }
    };
    getMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (socket && divRef.current) {
      socket.on("chat", (message, user, role) => {
        setMessages((ms) => [...ms, { message, name: user, role }]);
        setTimeout(() => {
          if (divRef.current) {
            divRef.current.scrollTop = divRef.current.scrollHeight;
          }
        }, 5);
      });
    }

    return () => {
      if (socket) {
        socket.off("chat");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  return (
    <div>
      <div
        className="h-4 w-full text-center cursor-pointer select-none mb-1"
        onClick={() => {
          setAdminFilter((t) => !t);
        }}
      >
        {adminFilter ? "Remove Filter" : "Filter: Admin"}
      </div>
      <div
        ref={divRef}
        className="h-[calc(100vh-280px)] w-full overflow-y-auto overflow-x-hidden p-4"
      >
        {adminFilter
          ? messages
              .filter((m) => m.role === "ADMIN")
              .map((m, id) => (
                <MessageBubble message={m} key={id}></MessageBubble>
              ))
          : messages.map((m, id) => (
              <MessageBubble message={m} key={id}></MessageBubble>
            ))}
      </div>
    </div>
  );
};

export default MessagesArea;
