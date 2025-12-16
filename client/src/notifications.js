import { io } from "socket.io-client";

let socket = null;
let callback = null;

export function initNotifications() {
  if (!socket) {
    socket = io("http://localhost:3000", {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity, // try forever
      reconnectionDelay: 1000,        // 1s between attempts
      reconnectionDelayMax: 5000,     // max 5s
    });

    socket.on("connect", () => console.log("WS connected:", socket.id));
    socket.on("disconnect", () => console.log("WS disconnected"));
    socket.on("connect_error", (err) => console.warn("WS connect_error:", err.message));
    socket.on("notification", (msg) => callback?.(msg));
  }
}

export function onNotification(cb) {
  callback = cb;
  return () => { callback = null; };
}

export function sendNotification(msg) {
  if (socket?.connected) socket.emit("notification", msg);
  else console.warn("Socket not connected, cannot send notification.");
}
