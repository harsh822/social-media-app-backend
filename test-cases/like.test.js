const chai = require("chai");
const Post = require("../models/Posts");
const chaiHttp = require("chai-http");
const expect = chai.expect;
const app = require("../app"); // replace this with the correct path to your app

chai.use(chaiHttp);

describe("API Endpoint: put /api/like/:id", () => {
  let postId = null;
  let userId = null;

  beforeEach(async () => {
    const post = new Post({
      title: "Test Post for Like",
      description: "This is a test post.",
      userId: "64340b56e525d01823d0f841",
    });
    const savedPost = await post.save();
    postId = savedPost._id;
    userId = savedPost.userId;
  });
  // const postId = "6434fee4b70fade8be39feea";
  it("should return a 200 status if the post is successfully liked by the user", (done) => {
    chai
      .request(app)
      .put(`/api/like/${postId}`)
      .send({ userId })
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.equal("Post Liked");
        done();
      });
  });
  it("should return a 404 error if userId is missing", (done) => {
    chai
      .request(app)
      .put(`/api/like/${postId}`)
      .send({})
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("error");
        expect(res.body.error).to.equal("Missing Required Fields");
        done();
      });
  });

  it("should return a 404 error if user is not found", (done) => {
    chai
      .request(app)
      .put(`/api/like/${postId}`)
      .send({ userId: "64340b56e525d01823d0f8uj" })
      .end((err, res) => {
        expect(res.status).to.equal(404);
        expect(res.body).to.have.property("error");
        expect(res.body.error).to.equal("User Not Found");
        done();
      });
  });

  it("should return a 403 error if the post is already liked by the user", (done) => {
    chai
      .request(app)
      .put(`/api/like/6434fee4b70fade8be39feea`)
      .send({ userId })
      .end((err, res) => {
        expect(res.status).to.equal(403);
        expect(res.body).to.have.property("error");
        expect(res.body.error).to.equal("You have already liked");
        done();
      });
  });
});
