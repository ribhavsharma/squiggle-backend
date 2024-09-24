const User = require("../models/User");

const createUser = async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "username is required" });
  }

  try {
    const newUser = new User({ username });
    await newUser.save();
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while creating the user" });
  }
  res.status(201).json({ message: "User created successfully", user: newUser });
};

module.exports = { createUser };
