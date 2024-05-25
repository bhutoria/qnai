import { useRecoilState, useRecoilValue } from "recoil";
import { ActiveSocketState, TimerState } from "@/store";
import { useCallback, useEffect, useRef, useState } from "react";
import MessagesArea from "../common/MessagesArea";
import { useSession } from "next-auth/react";
import { Textarea } from "../ui/textarea";
import TimedButton from "./TimedButton";

const UserChatBox = () => {
  const socket = useRecoilValue(ActiveSocketState);
  const [chatEnabled, setChatEnabled] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { data: session } = useSession();
  const [timer, setTimer] = useRecoilState(TimerState);

  useEffect(() => {
    if (socket) {
      socket.on("chatOn", () => {
        setChatEnabled(true);
      });
      socket.on("chatOff", () => {
        setChatEnabled(false);
      });
    }
  }, [socket]);

  const sendChat = useCallback(() => {
    if (socket && inputRef.current && chatEnabled) {
      if (
        inputRef.current.value.length > 0 &&
        inputRef.current.value.length < 255
      ) {
        socket.emit(
          "sendChat",
          inputRef.current.value,
          session?.user?.name,
          session?.user?.id
        );
        inputRef.current.value = "";
        setTimer(true);
      }
    }
  }, [socket, inputRef, session, chatEnabled, setTimer]);

  return (
    <div className="m-2 rounded-lg flex flex-col border-slate-100 border-2">
      <div className="flex flex-row items-center justify-between px-4 h-16 bg-slate-100 py-2 rounded-t-lg">
        <div className="text-2xl font-mono">Chat</div>
        <div
          className={`text-sm ${
            chatEnabled ? "text-emerald-500" : "text-rose-500"
          } `}
        >
          Status: {chatEnabled ? "Enabled" : "Disabled"}
        </div>
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
              e.preventDefault();
              if (timer) return;
              if (e.shiftKey) {
                return;
              }
              sendChat();
            }
          }}
        ></Textarea>
        <div className="absolute top-1/2 -translate-y-1/2 right-0 pr-4">
          <TimedButton
            chatEnabled={chatEnabled}
            sendChat={sendChat}
          ></TimedButton>
        </div>
      </div>
    </div>
  );
};

export default UserChatBox;
