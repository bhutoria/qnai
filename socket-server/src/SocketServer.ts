import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import { getRole } from "./utils/whoami";
import Assistant from "./Assistant";
import { createClient } from "redis";
import { prisma } from "./utils/prisma";
import dotenv from "dotenv";
dotenv.config();

type Room = {
  emit: boolean;
  timeOut?: NodeJS.Timeout;
  memberCount: number;
  adminSocket?: Socket;
};

class SocketServer {
  private static instance: SocketServer;
  private io: Server | null;
  private rooms: { [id: string]: Room } = {};
  private redisClient = createClient();

  private chat: { [key: string]: { message: string; id: string }[] } = {};

  private constructor() {
    this.io = null;
    this.redisClient.on("error", (error) => {
      console.error(error);
    });
    this.redisClient.connect();
    this.redisClient.on("connect", () => {
      console.log("connected to redis");
    });

    setInterval(() => {
      Object.keys(this.chat).forEach(async (room) => {
        const messages = this.chat[room];
        if (messages.length === 0) {
          return;
        }
        try {
          console.log("pushing chat to db");
          await prisma.chat.createMany({
            data: messages.map((message) => ({
              message: message.message,
              roomId: room,
              userId: message.id,
            })),
          });
          this.chat[room] = [];
        } catch (e) {
          console.log("Error while pushing chat to db");
          console.log(e);
        }
      });
    }, 10 * 1000);
  }

  static getInstance = () => {
    if (!SocketServer.instance) {
      SocketServer.instance = new SocketServer();
    }
    return SocketServer.instance;
  };

  initialize = (server: HTTPServer) => {
    console.log("initializing socket server");
    this.io = new Server(server, {
      cors: { origin: "*", methods: ["GET", "POST"] },
    });

    this.io.on("connection", async (socket) => {
      console.log("received new connection:", socket.id);
      const { room, user } = socket.handshake.query;

      if (!user || !room || Array.isArray(room) || Array.isArray(user)) {
        return socket.disconnect();
      }

      try {
        const role = await getRole(user);
        if (role === "ADMIN") {
          this.serveAdmin(socket, room);
        } else if (role === "USER") {
          this.serveUser(socket, room);
        } else {
          throw new Error("ROLE NOT FOUND");
        }
      } catch (e) {
        console.log(e);

        console.log("unable to get role for:", user);
        console.log("disconnecting socket");
        return socket.disconnect();
      }
    });
  };

  private serveAdmin = (socket: Socket, room: string) => {
    console.log("admin found for room:", room);

    this.chat[room] = this.chat[room] || [];

    if (this.rooms[room]) {
      this.rooms[room].emit = true;
      this.rooms[room].memberCount++;
      this.rooms[room].adminSocket = socket;
    } else {
      this.rooms[room] = { emit: true, memberCount: 1 };
      this.rooms[room].adminSocket = socket;
    }

    console.log("checking previous timeout for room", room);

    // clears the timeout used upon disconnection
    if (this.rooms[room].timeOut) {
      console.log("clearing previous timeout for room", room);
      clearTimeout(this.rooms[room].timeOut);
    } else {
      console.log("no previous timeout for room", room);
    }

    socket.join(room);
    this.io?.to(room).emit("chatOn");
    socket.emit("memberCount", this.rooms[room].memberCount);

    socket.on("emitOn", (callback) => {
      console.log("turning on chat for room", room);
      this.io?.to(room).emit("chatOn");
      this.rooms[room].emit = true;
      callback({
        emit: true,
      });
    });

    socket.on("emitOff", (callback) => {
      console.log("turning off chat for room", room);
      this.io?.to(room).emit("chatOff");
      this.rooms[room].emit = false;
      callback({
        emit: false,
      });
    });

    socket.on("sendChat", (message: string, user: string, id: string) => {
      this.io?.to(room).emit("chat", message.slice(0, 254), user, "ADMIN");
      this.chat[room].push({ message: message.slice(0, 254), id });
      Assistant.addMessage(message.slice(0, 254), room);
    });

    socket.on("generateSummary", async () => {
      console.log("request to generate summary");
      await Assistant.generateSummary(socket, room);
    });

    socket.on("disconnect", () => {
      console.log("admin disconnected:", socket.id);
      this.rooms[room].memberCount--;
      const timeOut = setTimeout(() => {
        console.log("switching off chat for room", room);
        this.io?.to(room).emit("chatOff");
        this.rooms[room].emit = false;
      }, 1000 * 60 * 3);
      this.rooms[room].timeOut = timeOut;
    });
  };

  private serveUser = (socket: Socket, room: string) => {
    console.log("connecting new user to: ", room);

    socket.join(room);

    if (this.rooms[room]) {
      const emit = this.rooms[room].emit;
      this.rooms[room].memberCount++;
      this.rooms[room].adminSocket?.emit(
        "memberCount",
        this.rooms[room].memberCount
      );
      if (emit) {
        socket.emit("chatOn");
      } else {
        socket.emit("chatOff");
      }
    } else {
      this.rooms[room] = { emit: false, memberCount: 1 };
      socket.emit("chatOff");
    }

    socket.on("sendChat", (message: string, user: string, id: string) => {
      this.manageChatMessage(message, user, id, room, socket);
    });

    socket.on("disconnect", () => {
      this.rooms[room].memberCount--;
      this.rooms[room].adminSocket?.emit(
        "memberCount",
        this.rooms[room].memberCount
      );
      console.log("disconnected:", socket.id);
    });
  };

  private manageChatMessage = async (
    message: string,
    user: string,
    id: string,
    room: string,
    socket: Socket
  ) => {
    const slicedMessage = message.slice(0, 254);

    try {
      const lastMessageTime = await this.redisClient.get(`lastMessage:${id}`);

      if (lastMessageTime) {
        const timeDifference = Date.now() - parseInt(lastMessageTime);
        if (timeDifference < 45000) {
          socket.emit(
            "chat",
            "Please wait before sending another message",
            "SYSTEM",
            "SYSTEM"
          );
          return;
        }
      }
      await this.redisClient.set(`lastMessage:${id}`, Date.now().toString(), {
        EX: 45,
        NX: true,
      });
    } catch (e) {
      console.log("Error while checking rate limit");
      console.log(e);
      socket.emit("chat", "Internal server error", "SYSTEM", "SYSTEM");
      return;
    }

    this.chat[room].push({ message: slicedMessage, id });

    if (this.rooms[room]?.emit === true) {
      this.io?.to(room).emit("chat", slicedMessage, user, "USER");
      Assistant.addMessage(slicedMessage, room);
    }
  };
}

export default SocketServer.getInstance();
