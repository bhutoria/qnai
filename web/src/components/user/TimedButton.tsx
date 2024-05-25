import { TimerState } from "@/store";
import { useState } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { useRecoilState } from "recoil";

interface TimedButtonProps {
  chatEnabled: boolean;
  sendChat: () => void;
}

const TimedButton = ({ sendChat, chatEnabled }: TimedButtonProps) => {
  const [timer, setTimer] = useRecoilState(TimerState);

  return (
    <div>
      {timer ? (
        <div className="text-xs">
          <CountdownCircleTimer
            isPlaying
            duration={45}
            colors={["#A30000", "#A30000", "#004777", "#F7B801"]}
            colorsTime={[45, 30, 15, 0]}
            size={30}
            strokeWidth={5}
            onComplete={() => {
              setTimer(false);
            }}
          >
            {({ remainingTime }) => remainingTime}
          </CountdownCircleTimer>
        </div>
      ) : (
        <button
          onClick={sendChat}
          disabled={!chatEnabled}
          className="bg-sky-100 p-2 disabled:bg-slate-200 disabled:text-slate-500 hover:bg-sky-200 font-mono rounded-lg"
        >
          Send
        </button>
      )}
    </div>
  );
};

export default TimedButton;
