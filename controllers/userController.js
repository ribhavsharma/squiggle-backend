const User = require("../models/User");
const { generateToken } = require("../utils/auth.js");

const createUser = async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    let existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const newUser = new User({ username });
    await newUser.save();

    const token = generateToken(newUser.username); // Generate token with user ID

    res.cookie("token", token, {
      httpOnly: true,
  sameSite: "Lax", // "Lax" or "Strict" for same-origin (cross-origin won't work locally with "None")
  secure: false, // Set secure to false for localhost (no HTTPS)
  maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    });

    res.json({ message: "User logged in successfully" });
  } catch (error) {
    console.error("Error in createUser:", error);
    return res.status(500).json({ error: "An error occurred" });
  }
};

const deleteUser = async (req, res) => {
  res.clearCookie("token");
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "username is required" });
  }

  try {
    await User.findOneAndDelete({ username });
    res.status(200).json({ message: "user deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "an error occurred while deleting the user" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    return res.status(200).json(users);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "an error occurred while fetching the users" });
  }
};

const loginUser = async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "username is required" });
  }
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  generateToken(req, res, user);
  res.json({ message: "Login successful" });
};

module.exports = { createUser, getAllUsers, deleteUser, loginUser };
