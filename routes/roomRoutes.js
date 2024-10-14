const express = require("express");
const {
  createRoom,
  joinRoom,
  leaveRoom,
  getAllRooms,
  getRoomDetails,
  getRoomUsers,
  assignDrawer,
} = require("../controllers/roomController");
const router = express.Router();

router.post("/create", createRoom);

router.post("/join", joinRoom);

router.get("/", getAllRooms);

router.get("/:roomCode", getRoomDetails);

router.get("/:roomCode/users", getRoomUsers);

router.post("/:roomCode/leave", leaveRoom);

router.post("/:roomCode/assign-drawer", assignDrawer);

module.exports = router;
