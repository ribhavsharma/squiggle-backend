const User = require("../models/User");

const createUser = async (req, res) => {
  console.log(req.body);
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "username is required" });
  }

  let newUser;
  try {
    let existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "username already exists" });
    }

    newUser = new User({ username });
    await newUser.save();

    res.status(201).json({ message: "user created!", user: newUser });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "an error occurred while creating the user" });
  }
};

const deleteUser = async (req, res) => {
  const { userId } = req.body;
  console.log(userId);

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    await User.findByIdAndDelete(userId);
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

module.exports = { createUser, getAllUsers, deleteUser };
