const {
  createUser,
  getAllUsers,
  deleteUser,
  loginUser
} = require("../controllers/userController");

const express = require("express");
const router = express.Router();

router.post("/create", createUser);

router.post("/delete", deleteUser);

router.post("/login", loginUser);

router.get("/", getAllUsers);

module.exports = router;
