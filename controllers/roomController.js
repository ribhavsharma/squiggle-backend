const Room = require("../models/Room");
const User = require("../models/User");

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
    const user = await User.findOne({username: username});
    

    if (!room) {
      return res.status(404).json({ error: "room not found" });
    }

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    room.users.push(username);
    await room.save();

    res.status(200).json({ message: "joined room successfully", room });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "an error occurred while joining the room" });
  }
};

const leaveRoom = async (req, res) => {
  const roomModel = await Room; 
  const {username, roomCode} = req.body;
  const room = await roomModel.findOne({ roomCode });

  room.users = room.users.filter((x)=> x !== username);
  await room.save();

  res.status(200).json({ message: "left room successfully", room });
}

const getAllRooms = async (req, res) => {
  const roomModel = await Room;
  const rooms = await roomModel.find();
  res.status(200).json({ rooms });
};


module.exports = { createRoom, joinRoom, leaveRoom, getAllRooms };
