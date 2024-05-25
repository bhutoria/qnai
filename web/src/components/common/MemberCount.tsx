import { ActiveSocketState } from "@/store";
import { useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";

const MemberCount = () => {
  const socket = useRecoilValue(ActiveSocketState);

  const countRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (socket) {
      socket.on("memberCount", (data: string) => {
        countRef.current!.innerText = data;
      });
    }

    return () => {
      if (socket) {
        socket.off("memberCount");
      }
    };
  }, [socket]);

  return (
    <div className="flex flex-row items-center">
      <span className="bg-slate-100 py-1 px-2 rounded-l-md border-2 border-slate-100">
        Members
      </span>
      <div
        className="border-2 border-slate-100 rounded-r-md py-1 px-2"
        ref={countRef}
      >
        0
      </div>
    </div>
  );
};

export default MemberCount;
