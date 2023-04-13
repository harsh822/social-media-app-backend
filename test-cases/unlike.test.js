const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");
const Post = require("../models/Posts");
const expect = chai.expect;

chai.use(chaiHttp);

describe("API Endpoint: put /api/unlike/:id", () => {
  let postId = null;
  let userId = null;

  beforeEach(async () => {
    const post = new Post({
      title: "Test Post for unlike",
      description: "This is a test post.",
      userId: "64340b56e525d01823d0f841",
    });
    const savedPost = await post.save();
    postId = savedPost._id;
    userId = savedPost.userId;
  });

  //   afterEach(async () => {
  //     await Post.deleteMany({});
  //   });

  it("should return an error if userId is missing", (done) => {
    chai
      .request(app)
      .put(`/api/unlike/${postId}`)
      .send({})
      .end((err, res) => {
        expect(res.status).to.equal(400);
        expect(res.body.error).to.equal("Missing Required Fields");
        done();
      });
  });

  it("should return an error if post is not found", (done) => {
    chai
      .request(app)
      .put(`/api/unlike/6434f623e92d2802a3ec50cb`)
      .send({ userId })
      .end((err, res) => {
        expect(res.status).to.equal(404);
        expect(res.body.error).to.equal("Post Not Found");
        done();
      });
  });

  it("should return an error if user is not the owner of the post", (done) => {
    chai
      .request(app)
      .put(`/api/unlike/${postId}`)
      .send({ userId: "invalidUser" })
      .end((err, res) => {
        expect(res.status).to.equal(404);
        expect(res.body.error).to.equal("User Not Found");
        done();
      });
  });

  it("should unlike the post if user has liked it before", (done) => {
    Post.findById(postId).then((post) => {
      post.likes.push(userId);
      post.save().then(() => {
        chai
          .request(app)
          .put(`/api/unlike/${postId}`)
          .send({ userId })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body).to.equal("Post unLiked");
            Post.findById(postId).then((updatedPost) => {
              expect(updatedPost.likes).to.not.include(userId);
              done();
            });
          });
      });
    });
  });

  it("should return an error if user has already unliked the post", (done) => {
    Post.findById(postId).then((post) => {
      post.likes.pull(userId);
      post.save().then(() => {
        chai
          .request(app)
          .put(`/api/unlike/${postId}`)
          .send({ userId })
          .end((err, res) => {
            expect(res.status).to.equal(403);
            expect(res.body).to.equal("You have already unliked");
            Post.findById(postId).then((updatedPost) => {
              expect(updatedPost.likes).to.not.include(userId);
              done();
            });
          });
      });
    });
  });
});
