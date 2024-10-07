const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
const roomRoutes = require("./routes/roomRoutes");
const userRoutes = require("./routes/userRoutes");
const { default: mongoose } = require("mongoose");
const session = require("express-session");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

app.use(
  session({
    secret: "secret-key", 
    resave: false,
    saveUninitialized: true,
  })
);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("connected to db");
  })
  .catch((e) => {
    console.log("error connecting to db:", e);
  });

app.get("/", (req, res) => {
  res.send("greetings");
});

app.use("/rooms", roomRoutes);
app.use("/users", userRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('join-room', (roomCode, username) => {
    socket.join(roomCode);
    console.log(username, 'joined room', roomCode);
  });

});




server.listen(3000, () => {
  console.log("server running on 3000");
});
