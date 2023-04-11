const router = require("express").Router();
const User = require("../models/User");
const Post = require("../models/Posts");

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

// create new post
router.post("/posts", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Delete a post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("Post is Deleted");
    } else {
      res.status(403).json("You cannot delete others post");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// Like a Post
router.put("/like/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("Post Liked");
    } else {
      res.status(403).json("You have already liked");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// UnLike a Post
router.put("/unlike/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.likes.includes(req.body.userId)) {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("Post unLiked");
    } else {
      res.status(403).json("You have already unliked");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get a Post
router.get("/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get all Posts
router.get("/all_posts", async (req, res) => {
  try {
    const allPosts = await Post.find({ userId: req.body.userId });
    allPosts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const newPostsArr = allPosts.map((post) => {
      return {
        id: post._id,
        title: post.title,
        desc: post.description,
        created_at: post.createdAt,
        comments: post.comments,
        likes: post.likes,
      };
    });
    res.status(200).json(newPostsArr);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
