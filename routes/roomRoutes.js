const express = require("express");
const {
  createRoom,
  joinRoom,
  leaveRoom,
  getAllRooms,
  getRoomDetails,
  getRoomUsers,
  saveCanvas,
  getCanvas
} = require("../controllers/roomController");
const router = express.Router();

router.post("/create", createRoom);

router.post("/join", joinRoom);

router.get("/", getAllRooms);

router.get("/:roomCode", getRoomDetails);

router.get("/:roomCode/users", getRoomUsers);

router.post("/:roomCode/leave", leaveRoom);

router.post("/:roomCode/save-canvas", saveCanvas);

router.post("/:roomCode/get-canvas", getCanvas);

module.exports = router;
