const express = require("express");
const { createRoom, joinRoom } = require("../controllers/roomController");
const router = express.Router();

router.post("/create", createRoom);

router.post("/join", joinRoom);

module.exports = router;
