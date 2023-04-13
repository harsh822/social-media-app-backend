const User = require("../models/User");
const Post = require("../models/Posts");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

exports.authenticateUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing Required Fields" });
    }
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ error: "User Not Found" });
    }
    const match = await bcrypt.compare(req.body.password, user.password);
    const accessToken = jwt.sign(
      JSON.stringify(user),
      process.env.TOKEN_SECRET
    );
    if (match) {
      res.status(200).json({ accessToken: accessToken });
    } else {
      res.status(403).json({ error: "Invalid Credentials" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.getUser = async (req, res) => {
  try {
    if (!req.body.userId) {
      return res.status(400).json({ error: "Missing Required Fields" });
    }
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).json({ error: "User Not Found" });
    }
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
  if (!req.body.userId) {
    return res.status(400).json({ error: "Missing Required Fields" });
  } else if (
    !isValidMongoObjectId(req.body.userId) ||
    !isValidMongoObjectId(req.params.id)
  ) {
    return res.status(404).json({ error: "Not Found" });
  } else if (req.body.userId !== req.params.id) {
    try {
      const userToFollow = await User.findById(req.params.id);
      if (!userToFollow) {
        return res.status(404).json({ error: "User To Follow Not Found" });
      }
      const currUser = await User.findById(req.body.userId);
      if (!currUser) {
        return res.status(404).json({ error: "Current User Not Found" });
      }
      if (!userToFollow.followers.includes(req.body.userId)) {
        await userToFollow.updateOne({ $push: { followers: req.body.userId } });
        await currUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("User Followed");
      } else {
        res.status(400).json({ error: "Already followed" });
      }
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(400).json({ error: "You can not follow yourself" });
  }
};

exports.unFollowUser = async (req, res) => {
  if (!req.body.userId) {
    return res.status(400).json({ error: "Missing Required Fields" });
  } else if (
    !isValidMongoObjectId(req.body.userId) ||
    !isValidMongoObjectId(req.params.id)
  ) {
    return res.status(404).json({ error: "Not Found" });
  } else if (req.body.userId !== req.params.id) {
    try {
      const userToUnFollow = await User.findById(req.params.id);
      if (!userToUnFollow) {
        return res.status(404).json({ error: "User To Unfollow Not Found" });
      }
      const currUser = await User.findById(req.body.userId);
      if (!currUser) {
        return res.status(404).json({ error: "Current User Not Found" });
      }
      if (userToUnFollow.followers.includes(req.body.userId)) {
        await userToUnFollow.updateOne({
          $pull: { followers: req.body.userId },
        });
        await currUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("User Unfollowed");
      } else {
        res.status(400).json({ error: "Already Unfollowed" });
      }
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(400).json({ error: "You can not unfollow yourself" });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { userId, title, description } = req.body;
    if (!userId || !title || !description) {
      return res.status(400).json({ error: "Missing Required Fields" });
    }
    const newPost = new Post(req.body);
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
    if (!req.body.userId) {
      return res.status(400).json({ error: "Missing Required Fields" });
    }
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ error: "Post Not Found" });
    } else if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("Post is Deleted");
    } else {
      res.status(403).json({ error: "You cannot delete others post" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.likePost = async (req, res) => {
  try {
    if (!req.body.userId) {
      return res.status(400).json({ error: "Missing Required Fields" });
    }
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json("Post Not Found");
    } else if (post.userId !== req.body.userId) {
      res.status(404).json({ error: "User Not Found" });
    } else if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("Post Liked");
    } else {
      res.status(403).json({ error: "You have already liked" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.unlikePost = async (req, res) => {
  try {
    if (!req.body.userId) {
      return res.status(400).json({ error: "Missing Required Fields" });
    }
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ error: "Post Not Found" });
    } else if (post.userId !== req.body.userId) {
      res.status(404).json({ error: "User Not Found" });
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
    const { userId, comment } = req.body;
    if (!userId || !comment) {
      return res.status(400).json({ error: "Missing Required Fields" });
    }
    const post = await Post.findById(req.params.id);
    // console.log("❤️", post);
    // console.log("req.body", req.body);
    if (!post) {
      res.status(404).json({ error: "Post Not Found" });
    } else if (post.userId !== req.body.userId) {
      res.status(404).json({ error: "User Not Found" });
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
      res.status(404).json({ error: "Post Not Found" });
    } else {
      res.status(200).json(post);
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    if (!req.body.userId) {
      return res.status(400).json({ error: "Missing Required Fields" });
    }
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

function isValidMongoObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}
