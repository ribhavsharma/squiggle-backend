const express = require("express");
const { createRoom, joinRoom, leaveRoom, getAllRooms, getRoomDetails } = require("../controllers/roomController");
const router = express.Router();

router.post("/create", createRoom);

router.post("/join", joinRoom);

router.post("/leave", leaveRoom);

router.get("/", getAllRooms);

router.get("/:roomCode", getRoomDetails);



module.exports = router;
