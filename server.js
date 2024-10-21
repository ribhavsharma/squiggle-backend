const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
const roomRoutes = require("./routes/roomRoutes");
const userRoutes = require("./routes/userRoutes");
const { default: mongoose } = require("mongoose");
const User = require("./models/User");
const Room = require("./models/Room");
const { default: axios } = require("axios");
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

const roomTimers = {};

const startRoomTimer = (roomCode, duration) => {
  if (roomTimers[roomCode] && roomTimers[roomCode].interval) {
    clearInterval(roomTimers[roomCode].interval);
    delete roomTimers[roomCode];
  }
  let remainingTime = duration;
  roomTimers[roomCode] = {
    remainingTime,
    interval: setInterval(() => {
      remainingTime--;
      io.to(roomCode).emit("timer-update", { remainingTime });

      if (remainingTime <= 0) {
        clearInterval(roomTimers[roomCode].interval);
        delete roomTimers[roomCode];
        io.to(roomCode).emit("timer-ended", { roomCode });
        handleTimerEnd(roomCode);
      }
    }, 1000),
  };
};

const handleTimerEnd = async (roomCode) => {
  try {
    console.log(`Timer for room ${roomCode} has ended.`);
    const roomModel = await Room;
    const room = await roomModel.findOne({ roomCode });

    if (!room) {
      console.error("Room not found");
      return;
    }

    // Increment the round
    room.currentRound += 1;

    if (room.currentRound > room.maxRounds) {
      // End the game if the max rounds are exceeded
      room.gameStarted = false;
      room.currentRound = 1;
      room.correctGuesses = [];
      room.currentDrawer = "";
      room.currentWord = "";
      room.round += 1;
      await room.save(); // Save the updated room state
      io.to(roomCode).emit("game-ended"); // Emit game ended if needed
    } else {
      // Reset for the next round
      room.correctGuesses = [];

      // Cycle to the next drawer based on drawerIndex
      room.drawerIndex = (room.drawerIndex + 1) % room.users.length;
      room.currentDrawer = room.users[room.drawerIndex];

      console.log("next drawer", room.currentDrawer);

      // Fetch a new word for the drawer
      room.currentWord = await fetchRandomWord();

      // Save the updated room state
      await room.save();

      // Emit the next-round event to notify all users in the room
      io.to(roomCode).emit("next-round", {
        currentRound: room.currentRound,
        currentDrawer: room.currentDrawer,
        currentWord: room.currentWord,
      });

      // Start the timer for the next round
      startRoomTimer(roomCode, 60);
    }
  } catch (error) {
    console.error("Error handling timer end:", error);
  }
};

const fetchRandomWord = async () => {
  const response = await axios.get(
    "https://random-word-form.herokuapp.com/random/noun"
  );
  const data = await response.data;
  return data[0];
};

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

  socket.on("start-game", async (roomCode) => {
    try {
      const roomModel = await Room;
      const room = await roomModel.findOne({ roomCode });
      if (room) {
        room.gameStarted = true;

        // If this is the first round, randomly pick the initial drawer
        if (!room.currentDrawer) {
          const initialIndex = Math.floor(Math.random() * room.users.length);
          room.drawerIndex = initialIndex;
          room.currentDrawer = room.users[initialIndex];
        } else {
          // Otherwise, cycle to the next user based on drawerIndex
          room.drawerIndex = (room.drawerIndex + 1) % room.users.length;
          room.currentDrawer = room.users[room.drawerIndex];
        }

        // Fetch a random word for the drawer
        room.currentWord = await fetchRandomWord();

        // Save the updated room state
        await room.save();

        // Emit the event to notify all users in the room
        io.to(roomCode).emit("drawer-assigned", {
          currentDrawer: room.currentDrawer,
          currentWord: room.currentWord,
        });

        startRoomTimer(roomCode, 60);
      } else {
        console.error("Room not found");
      }
    } catch (error) {
      console.error("Error starting game:", error);
    }
  });

  socket.on("chatMessage", async (message) => {
    const roomModel = await Room;
    const room = await roomModel.findOne({ roomCode: message.roomCode });

    if (!room) {
      console.error("Room not found");
      return;
    }

    if (message.message === room.currentWord) {
      io.to(message.roomCode).emit("correct-guess", message.username);

      if (!room.correctGuesses.includes(message.username)) {
        room.correctGuesses.push(message.username);
      }

      if (room.correctGuesses.length === room.users.length - 1) {
        room.currentRound += 1;

        if (room.currentRound > room.maxRounds) {
          room.gameStarted = false;
          room.currentRound = 1;
          room.correctGuesses = [];
          room.currentDrawer = "";
          room.currentWord = "";
          room.round += 1;
          await room.save();
          io.to(message.roomCode).emit("game-ended");
        } else {
          room.correctGuesses = [];

          console.log("current drawer", room.currentDrawer);
          console.log("all users", room.users);
          console.log(room.drawerIndex + 1);

          room.drawerIndex = (room.drawerIndex + 1) % room.users.length;
          room.currentDrawer = room.users[room.drawerIndex];

          console.log("next drawer", room.currentDrawer);

          room.currentWord = await fetchRandomWord();

          await room.save();

          io.to(message.roomCode).emit("next-round", {
            currentRound: room.currentRound,
            currentDrawer: room.currentDrawer,
            currentWord: room.currentWord,
          });

          startRoomTimer(message.roomCode, 60);
        }
      } else {
        await room.save();
      }
    } else {
      io.to(message.roomCode).emit("message", message);
    }
  });

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

  socket.on("drawer-assigned", (roomCode, drawer, word) => {
    io.to(roomCode).emit("drawer-assigned", {
      currentDrawer: drawer,
      currentWord: word,
    });
  });
});

server.listen(3000, () => {
  console.log("server running on 3000");
});
