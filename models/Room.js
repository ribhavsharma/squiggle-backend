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
  });

  return mongoose.model("Room", roomSchema);
}

module.exports = createRoomSchema();
