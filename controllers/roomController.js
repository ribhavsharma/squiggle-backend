const Room = require("../models/Room");
const User = require("../models/User");
const axios = require("axios");

const createRoom = async (req, res) => {
  try {
    const roomModel = await Room;
    const room = new roomModel();
    console.log(room);
    await room.save();

    res.status(201).json({ message: "room created successfully", room });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while creating the room" });
  }
};

const joinRoom = async (req, res) => {
  const { roomCode, username } = req.body;
  if (!roomCode || !username) {
    return res
      .status(400)
      .json({ error: "roomcode and username are required" });
  }

  try {
    const roomModel = await Room;
    const room = await roomModel.findOne({ roomCode });
    const user = await User.findOne({ username: username });

    if (!room) {
      return res.status(404).json({ error: "room not found" });
    }

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    if (room.users.includes(username)) {
      return res.status(400).json({ error: "user already in room" });
    }
    room.users.push(username);

    if(room.users.length === 1){
      room.host = room.users[0];
      await room.save();
    }

    await room.save();

    res.status(200).json({ message: "joined room successfully", room });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "an error occurred while joining the room" });
  }
};

const leaveRoom = async (req, res) => {
  const roomCode = req.params.roomCode;
  const roomModel = await Room;
  const { username } = req.body;
  const room = await roomModel.findOne({ roomCode });

  room.users = room.users.filter((x) => x !== username);
  await room.save();

  if(room.users.length === 0) {
    await roomModel.deleteOne({ roomCode });
  }

  res.status(200).json({ message: "left room successfully", room });
};

const getAllRooms = async (req, res) => {
  const roomModel = await Room;
  const rooms = await roomModel.find();
  res.status(200).json({ rooms });
};

const getRoomDetails = async (req, res) => {
  const { roomCode } = req.params;
  const roomModel = await Room;
  try {
    const room = await roomModel.findOne({ roomCode });
    console.log(room);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.status(200).json({ room });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the room details" });
  }
};

const assignDrawer = async (req, res) => {
  const { roomCode } = req.params;
  const roomModel = await Room;

  try {
    const room = await roomModel.findOne({ roomCode });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const users = room.users;
    const currentDrawer = users[Math.floor(Math.random() * users.length)];

    room.currentDrawer = currentDrawer;
    room.currentWord = await fetchRandomWord();
    room.gameStarted = true; 
    await room.save();

    res.status(200).json({ drawer: currentDrawer, word: room.currentWord });
  } catch (error) {
    console.error("Error during drawer assignment:", error);
  }
};
  

const getRoomUsers = async (req, res) => {
  const { roomCode } = req.params;
  const roomModel = await Room;
  try {
    const room = await roomModel.findOne({ roomCode });
    console.log(room);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.status(200).json({ users: room.users });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the room users" });
  }
};

const fetchRandomWord = async () => {
  const response = await axios.get('https://random-word-form.herokuapp.com/random/noun');
  const data = await response.data;
  return data[0];
}

module.exports = {
  createRoom,
  joinRoom,
  leaveRoom,
  getAllRooms,
  getRoomDetails,
  getRoomUsers,
  assignDrawer,
};
