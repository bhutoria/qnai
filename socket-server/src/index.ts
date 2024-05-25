import { createServer } from "http";
import SocketServer from "./SocketServer";
import dotenv from "dotenv";
dotenv.config();

const server = createServer();

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log("listening on port", PORT);
  SocketServer.initialize(server);
});
