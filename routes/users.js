const router = require("express").Router();
const User = require("../models/User");

// Find User
router.get("/user/:id", async (req, res) => {
  try {
    console.log("Request", req.params);
    const user = await User.findById(req.params.id);
    const response = {
      username: user.username,
      numberOfFollowers: user.followers.length,
      numberOfFollowings: user.followings.length,
    };
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Follow a User
router.put("/follow/:id", async (req, res) => {
  //   console.log("Follow request", req);
  if (req.body.id !== req.params.id) {
    try {
      const userToFollow = await User.findById(req.params.id);
      const currUser = await User.findById(req.body.userId);
      if (!userToFollow.followers.includes(req.body.userId)) {
        await userToFollow.updateOne({ $push: { followers: req.body.userId } });
        await currUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("User Followed");
      } else {
        res.status(400).json("Already followed");
      }
    } catch (error) {}
  } else {
    res.status(400).json("You can not follow yourself");
  }
});

// Unfollow a User
router.put("/unfollow/:id", async (req, res) => {
  console.log("unFollow request", req.params);
  if (req.body.id !== req.params.id) {
    try {
      const userToUnFollow = await User.findById(req.params.id);
      const currUser = await User.findById(req.body.userId);
      if (userToUnFollow.followers.includes(req.body.userId)) {
        await userToUnFollow.updateOne({
          $pull: { followers: req.body.userId },
        });
        await currUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("User Unfollowed");
      } else {
        res.status(400).json("Already unFollowed");
      }
    } catch (error) {}
  } else {
    res.status(400).json("You can not follow yourself");
  }
});

module.exports = router;
