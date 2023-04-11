const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

module.exports = (req, res, next) => {
  try {
    console.log("Headers", req.headers);
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    console.log("Decoded Token", decodedToken);
    const userId = decodedToken._id;
    if (req.body.userId && req.body.userId !== userId) {
      res.status(401).json("Invalid user ID");
    } else {
      req.userId = userId;
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error("Invalid request!"),
    });
  }
};