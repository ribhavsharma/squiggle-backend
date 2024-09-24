const express = require("express");
const roomRoutes = require("./routes/roomRoutes");
const userRoutes = require("./routes/userRoutes");
const { default: mongoose } = require("mongoose");
require("dotenv").config();

const app = express();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("connected to db");
  })
  .catch((e) => {
    console.log("error connecting to db:", e);
  });

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/rooms", roomRoutes);
app.use("/users", userRoutes);

app.listen(3000, () => {
  console.log("server running on 3000");
});
