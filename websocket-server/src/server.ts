import express from "express";
import { Server } from "socket.io";
import http from "http";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const userQueue = [];
const matchedPairs = new Map();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("findMatch", (data) => {
    console.log("Find match request from", socket.id, ":", data);

    const match = userQueue.find(
      (user) =>
        user.preferences.size === data.preferences.size &&
        user.preferences.sauce === data.preferences.sauce &&
        user.preferences.crust === data.preferences.crust &&
        user.preferences.cheese === data.preferences.cheese
    );

    if (match) {
      console.log("Match found:", match.socket.id);
      socket.emit("matchFound", match.location);
      match.socket.emit("matchFound", data.location);

      // Store the matched pair
      matchedPairs.set(socket.id, match.socket.id);
      matchedPairs.set(match.socket.id, socket.id);

      userQueue.splice(userQueue.indexOf(match), 1);
    } else {
      userQueue.push({
        socket,
        preferences: data.preferences,
        location: data.location,
      });
    }
  });

  socket.on("updateLocation", (location) => {
    console.log("Location update from", socket.id, ":", location);

    // Find the matched user and send them the location update
    const matchedUserId = matchedPairs.get(socket.id);
    if (matchedUserId) {
      const matchedSocket = io.sockets.sockets.get(matchedUserId);
      if (matchedSocket) {
        matchedSocket.emit("locationUpdate", location);
      }
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("A user disconnected:", socket.id, "Reason:", reason);

    // Remove from queue if present
    const index = userQueue.findIndex((user) => user.socket.id === socket.id);
    if (index !== -1) {
      userQueue.splice(index, 1);
    }

    // Remove from matched pairs if present
    const matchedUserId = matchedPairs.get(socket.id);
    if (matchedUserId) {
      matchedPairs.delete(socket.id);
      matchedPairs.delete(matchedUserId);

      // Notify the matched user about the disconnection
      const matchedSocket = io.sockets.sockets.get(matchedUserId);
      if (matchedSocket) {
        matchedSocket.emit("matchDisconnected");
      }
    }
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

server.on("error", (error) => {
  console.error("Server error:", error);
});
