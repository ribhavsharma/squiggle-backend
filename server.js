const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
const roomRoutes = require("./routes/roomRoutes");
const userRoutes = require("./routes/userRoutes");
const { default: mongoose } = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("connected to db");
  })
  .catch((e) => {
    console.log("error connecting to db:", e);
  });

app.get("/", (req, res) => {
  res.send("elo");
});

app.use("/rooms", roomRoutes);
app.use("/users", userRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("user-disconnect", async (data) => {
    const { username } = data;
    try {
      await User.findOneAndDelete({ username });
      console.log(`User ${username} deleted from the database`);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  });

  socket.on("chatMessage", (message) => {
    console.log("message:", message);
    io.to(message.roomCode).emit("message", message);
  })

  socket.on("draw", ({ x, y, roomCode }) => {
    socket.to(roomCode).emit("draw-data", { x, y });
  });

  socket.on("beginPath", ({ x, y, roomCode }) => {
    socket.to(roomCode).emit("beginPath", { x, y });
  });

  socket.on("resetCanvas", (roomCode) => {
    socket.to(roomCode).emit("resetCanvas");
  });

  socket.on("join-room", (roomCode, username) => {
    socket.join(roomCode);
    console.log(username, "joined room", roomCode);
    io.to(roomCode).emit("user-joined", { username, roomCode });
  });

  socket.on("leave-room", (roomCode, username) => {
    socket.leave(roomCode);
    console.log(username, "left room", roomCode);
    io.to(roomCode).emit("user-left", { username, roomCode });
  });
});

server.listen(3000, () => {
  console.log("server running on 3000");
});
