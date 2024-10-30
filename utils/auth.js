const jwt = require("jsonwebtoken");
require('dotenv').config();

const generateToken = (user) => {
  const token = jwt.sign({ id: user }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  return token;
};


const verifyToken = (req, res, next) => {
  const token = req.cookies.token; 

  if (!token) {
    return res.status(401).json({ message: "Access Denied" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid Token" });
  }
};

module.exports = { generateToken, verifyToken };
