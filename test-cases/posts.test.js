const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");
const Post = require("../models/Posts");

chai.use(chaiHttp);
const expect = chai.expect;
describe("API Endpoint: POST /api/posts", () => {
  let postId;
  it("should create a new post", (done) => {
    const post = {
      userId: "64379c8516d4a2f034373eac",
      title: "first Post",
      description: "It is a description for user FIRST",
    };

    chai
      .request(app)
      .post("/api/posts")
      .send(post)
      .end(async (err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("postId");
        expect(res.body.title).to.equal(post.title);
        expect(res.body.desc).to.equal(post.description);
        postId = res.body.postId;
        const currPost = await Post.findOne({ _id: res.body.postId });
        expect(currPost.title).to.equal(post.title);
        expect(currPost.description).to.equal(post.description);
        done();
      });
  });
  it("should test post creation with missing title", (done) => {
    const post = {
      userId: "64379c8516d4a2f034373eac",
      description: "It is a description for user FIRST",
    };

    chai
      .request(app)
      .post("/api/posts")
      .send(post)
      .end(async (err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("error");
        expect(res.body.error).to.equal("Missing Required Fields");
        done();
      });
  });
  it("should test post creation with missing description", (done) => {
    const post = {
      userId: "64379c8516d4a2f034373eac",
      title: "first Post",
    };

    chai
      .request(app)
      .post("/api/posts")
      .send(post)
      .end(async (err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("error");
        expect(res.body.error).to.equal("Missing Required Fields");
        done();
      });
  });

  const otherPostId = "6434fee4b70fade8be39feea";
  it("should delete a post if the user is authorized", (done) => {
    setTimeout(() => {
      chai
        .request(app)
        .delete(`/api/posts/${postId}`)
        .send({ userId: "64379c8516d4a2f034373eac" })
        .end(async (err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.equal("Post is Deleted");
          const deletedPost = await Post.findById(postId);
          expect(deletedPost).to.be.null;
          done();
        });
    }, 1000);
  });

  it("should return 404 error if the post does not exist", (done) => {
    chai
      .request(app)
      .delete(`/api/posts/${postId}`)
      .send({ userId: "64379c8516d4a2f034373eac" })
      .end(async (err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("error");
        expect(res.body.error).to.equal("Post Not Found");
        done();
      });
  });

  it("should return 400 error if userId is missing", (done) => {
    chai
      .request(app)
      .delete(`/api/posts/${otherPostId}`)
      .send({})
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("error");
        expect(res.body.error).to.equal("Missing Required Fields");
        done();
      });
  });
});
