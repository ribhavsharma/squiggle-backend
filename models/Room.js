const mongoose = require("mongoose");

async function createRoomSchema() {
  const { nanoid } = await import("nanoid");

  const roomSchema = new mongoose.Schema({
    roomCode: {
      type: String,
      default: () => nanoid(6),
      unique: true,
    },
    users: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
    currentDrawer: { type: String },
    currentWord: { type: String },
    round: { type: Number, default: 1 },
    maxRounds: { type: Number, default: 3 },
    host: { type: String },
    gameStarted: { type: Boolean, default: false },
    canvasData: { type: String },
  });

  return mongoose.model("Room", roomSchema);
}

module.exports = createRoomSchema();
