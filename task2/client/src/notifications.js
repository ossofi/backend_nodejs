import { io } from "socket.io-client";

let socket = null;
let callback = null;

export function initNotifications() {
  if (!socket) {
    socket = io("http://localhost:5050");

    socket.on("connect", () => {
      console.log("WS connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("WS disconnected");
    });

    socket.on("notification", (msg) => {
      if (callback) callback(msg);
    });
  }
}

export function onNotification(cb) {
  callback = cb;

  return () => {
    callback = null;
  };
}

export function sendNotification(msg) {
  if (socket && socket.connected) {
    socket.emit("notification", msg);
  } else {
    console.warn("Socket not connected, cannot send notification.");
  }
}
