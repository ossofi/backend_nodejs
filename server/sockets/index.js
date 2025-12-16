import { Server as IOServer } from "socket.io";

export function initSocket(httpServer, CLIENT_URL) {
  const io = new IOServer(httpServer, {
    cors: {
      origin: CLIENT_URL,
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("WS client connected:", socket.id);

    socket.on("disconnect", () =>
      console.log("WS client disconnected:", socket.id)
    );
  });

  return io;
}
