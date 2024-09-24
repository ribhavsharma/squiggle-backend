const Room = require("../models/roomModel");
const User = require("../models/User");

const createRoom = async (req, res) => {
  const room = new Room();
  try {
    await room.save();
  } catch (error) {
    return res
      .status(500)
      .json({ error: "an error occurred while creating the room" });
  }
  res.status(201).json({ message: "room created successfully", room });
};

const joinRoom = async (req, res) => {
  const { roomCode, username } = req.body;
  if (!roomCode || !username) {
    return res
      .status(400)
      .json({ error: "roomcode and username are required" });
  }

  try {
    const room = await Room.findOne({ roomCode });
    const user = await User.findOne({ username });
    if (!room) {
      return res.status(404).json({ error: "room not found" });
    }

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    room.users.push(username);
    await room.save();
  } catch (error) {
    return res
      .status(500)
      .json({ error: "an error occurred while joining the room" });
  }
  res.status(200).json({ message: "joined room successfully", room });
};

module.exports = { createRoom, joinRoom };
