const User = require("../models/User");
const Post = require("../models/Posts");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

exports.authenticateUser = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  try {
    const match = await bcrypt.compare(req.body.password, user.password);
    const accessToken = jwt.sign(
      JSON.stringify(user),
      process.env.TOKEN_SECRET
    );
    if (match) {
      res.status(200).json({ accessToken: accessToken });
    } else {
      res.status(403).json({ message: "Invalid Credentials" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const response = {
      username: user.username,
      numberOfFollowers: user.followers.length,
      Followings: user.followings,
    };
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.followUser = async (req, res) => {
  if (req.body.userId !== req.params.id) {
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
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(400).json("You can not follow yourself");
  }
};

exports.unFollowUser = async (req, res) => {
  if (req.body.userId !== req.params.id) {
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
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(400).json("You can not unfollow yourself");
  }
};

exports.createPost = async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    const response = {
      postId: savedPost._id,
      title: savedPost.title,
      desc: savedPost.description,
      createdTime: savedPost.createdAt,
    };
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json("Post Not Found");
    } else if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("Post is Deleted");
    } else {
      res.status(403).json("You cannot delete others post");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json("Post Not Found");
    } else if (post.userId !== req.body.userId) {
      res.status(404).json("User Not Found");
    } else if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("Post Liked");
    } else {
      res.status(403).json("You have already liked");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json("Post Not Found");
    } else if (post.userId !== req.body.userId) {
      res.status(404).json("User Not Found");
    } else if (post.likes.includes(req.body.userId)) {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("Post unLiked");
    } else {
      res.status(403).json("You have already unliked");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.commentOnPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json("Post Not Found");
    } else if (post.userId !== req.body.userId) {
      res.status(404).json("User Not Found");
    } else {
      const uniqueCommentId = generateUniqueCommentId();
      await post.updateOne({
        $push: {
          comments: {
            commentID: uniqueCommentId,
            comment: req.body.comment,
          },
        },
      });
      res.status(200).json({ commentID: uniqueCommentId });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json("Post Not Found");
    } else {
      res.status(200).json(post);
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.getAllPosts = async (req, res) => {
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
};

function generateUniqueCommentId() {
  return new Date().getTime() + new Date().getFullYear() + new Date().getDate();
}
