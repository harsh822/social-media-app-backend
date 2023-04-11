const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
router.post("/register", async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const newUser = await new User({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
  });
  try {
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
  }
});

router.post("/", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  try {
    const match = await bcrypt.compare(req.body.password, user.password);
    const accessToken = jwt.sign(
      JSON.stringify(user),
      process.env.TOKEN_SECRET
    );
    // const decoded = jwt.verify(accessToken, process.env.TOKEN_SECRET);
    // // var userId = decoded.id;
    // console.log("Decoded", decoded);
    if (match) {
      res.status(200).json({ accessToken: accessToken });
    } else {
      res.status(403).json({ message: "Invalid Credentials" });
    }
  } catch (error) {
    res.status(500).json(error);
    console.log(e);
  }
});

module.exports = router;
