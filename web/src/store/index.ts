import type { Rooms } from "@prisma/client";
import { atom } from "recoil";
import { Socket } from "socket.io-client";

export const AdminRoomsState = atom<Rooms[]>({
  key: "AdminRooms",
  default: [],
});

export const ActiveRoomState = atom<Rooms | null>({
  key: "ActiveRoom",
  default: null,
});

export const ActiveSocketState = atom<Socket | null>({
  key: "ActiveSocket",
  default: null,
  dangerouslyAllowMutability: true,
});

export type Messages = {
  message: string;
  name: string;
  role: "ADMIN" | "USER";
};

export const MessagesState = atom<Messages[]>({
  key: "Messages",
  default: [],
});

export type Summary = {
  summary: string[];
  createdAt: string;
};

export const SummaryState = atom<Summary[]>({
  key: "Summary",
  default: [],
});

export const TimerState = atom({
  key: "Timer",
  default: false,
});
