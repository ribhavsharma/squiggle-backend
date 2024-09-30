const express = require("express");
const { createRoom, joinRoom, leaveRoom, getAllRooms } = require("../controllers/roomController");
const router = express.Router();

router.post("/create", createRoom);

router.post("/join", joinRoom);

router.post("/leave", leaveRoom);

router.get("/all", getAllRooms);



module.exports = router;
