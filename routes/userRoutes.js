const {
  createUser,
  getAllUsers,
  deleteUser,
} = require("../controllers/userController");

const express = require("express");
const router = express.Router();

router.post("/create", createUser);

router.post("/delete", deleteUser);

router.get("/", getAllUsers);

module.exports = router;
