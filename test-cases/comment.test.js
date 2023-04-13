const chai = require("chai");
const Post = require("../models/Posts");
const expect = chai.expect;

const app = require("../app");

describe("API Endpoint: put api/comment/:id", () => {
  let postId = null;
  let userId = null;

  beforeEach(async () => {
    const post = new Post({
      title: "Test Post for comment",
      description: "This is a test post.",
      userId: "64340b56e525d01823d0f841",
    });
    const savedPost = await post.save();
    postId = savedPost._id;
    userId = savedPost.userId;
  });
  it("should return a 400 error if userId or comment is missing", (done) => {
    chai
      .request(app)
      .put(`/api/comment/${postId}`)
      .send({})
      .end((err, res) => {
        expect(res.status).to.equal(400);
        expect(res.body.error).to.equal("Missing Required Fields");
        done();
      });
  });

  it("should return a 404 error if the userId does not match the post userId", (done) => {
    chai
      .request(app)
      .put(`/api/comment/${postId}`)
      .send({ userId: "64340b56e525d01823d0f855", comment: "test comment" })
      .end((err, res) => {
        expect(res.status).to.equal(404);
        expect(res.body.error).to.equal("User Not Found");
        done();
      });
  });

  it("should add a comment to the post and return the commentID", (done) => {
    chai
      .request(app)
      .put(`/api/comment/${postId}`)
      .send({ userId: userId, comment: "test comment" })
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body.commentID).to.exist;
        done();
      });
  });
});
