const router = require("express").Router();
const userController = require("../controllers/user-controller");
const authenticate = require("../middleware/auth");

// Authenticate and return access token
router.post("/authenticate", userController.authenticateUser);

// Follow a User
router.put("/follow/:id", userController.followUser);

// Unfollow a User
router.put("/unfollow/:id", userController.unFollowUser);

// Find a User
router.get("/user", authenticate, userController.getUser);

// create new post
router.post("/posts", userController.createPost);

// Delete a post
router.delete("posts/:id", userController.deletePost);

// Like a Post
router.put("/like/:id", userController.likePost);

// UnLike a Post
router.put("/unlike/:id", userController.unlikePost);

// Comment on  Post
router.put("/comment/:id", userController.commentOnPost);

// Get a Post
router.get("/posts/:id", userController.getPost);

// Get all Posts
router.get("/all_posts", userController.getAllPosts);

module.exports = router;
