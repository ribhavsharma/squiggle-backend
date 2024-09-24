const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const generateRoomCode = () => nanoid(6);

const roomSchema = new mongoose.Schema({
  roomCode: {
    type: String,
    default: generateRoomCode,
    unique: true,
  },
  users: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Room", roomSchema);
