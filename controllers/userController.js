const User = require("../models/User");

const createUser = async (req, res) => {
  console.log(req.body);
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "username is required" });
  }

  let newUser;
  try {
    newUser = new User({ username });
    await newUser.save();
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while creating the user" });
  }
  res.status(201).json({ message: "user created!", user: newUser });
};

module.exports = { createUser };
