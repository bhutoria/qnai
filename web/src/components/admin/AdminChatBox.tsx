import { useRecoilValue } from "recoil";
import { Button } from "../ui/button";
import { ActiveSocketState } from "@/store";
import { useCallback, useEffect, useRef, useState } from "react";
import MessagesArea from "../common/MessagesArea";
import { useSession } from "next-auth/react";
import { Textarea } from "../ui/textarea";

const AdminChatBox = () => {
  const socket = useRecoilValue(ActiveSocketState);
  const [chatEnabled, setChatEnabled] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { data: session } = useSession();

  const onClick = useCallback(() => {
    if (socket) {
      if (!chatEnabled) {
        socket.emit("emitOn", (resp: { emit: boolean }) => {
          if (resp.emit) {
            setChatEnabled(true);
          }
        });
      } else {
        socket.emit("emitOff", (resp: { emit: boolean }) => {
          if (!resp.emit) {
            setChatEnabled(false);
          }
        });
      }
    }
  }, [socket, chatEnabled]);

  const sendChat = useCallback(() => {
    if (socket && inputRef.current) {
      if (inputRef.current.value.length > 0) {
        socket.emit(
          "sendChat",
          inputRef.current.value.slice(0, 254),
          session?.user?.name,
          session?.user?.id
        );
        inputRef.current.value = "";
      }
    }
  }, [socket, inputRef, session]);

  return (
    <div className="m-2 rounded-lg flex flex-col border-slate-100 border-2">
      <div className="flex flex-row items-center justify-between px-4 h-16 bg-slate-100 py-2 rounded-t-lg">
        <div className="text-2xl font-mono">Chat</div>
        <Button variant={"outline"} onClick={onClick}>
          {chatEnabled ? "Disable Chat" : "Enable Chat"}
        </Button>
      </div>
      <div className="grow">
        <MessagesArea></MessagesArea>
      </div>
      <div className="w-full h-24 relative">
        <Textarea
          ref={inputRef}
          maxLength={255}
          className="w-full h-24 pr-20 resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (e.shiftKey) {
                return;
              }
              e.preventDefault();
              sendChat();
            }
          }}
        ></Textarea>
        <div className="absolute top-1/2 -translate-y-1/2 right-0 pr-4">
          <button
            onClick={sendChat}
            className="bg-sky-100 p-2 hover:bg-sky-200 font-mono rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminChatBox;
