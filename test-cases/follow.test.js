const chai = require("chai");
const chaiHttp = require("chai-http");
const User = require("../models/User");
const app = require("../app");

chai.use(chaiHttp);
const expect = chai.expect;

describe("API Endpoint: /api/follow/{:id}", () => {
  let followerId = "64379c8516d4a2f034373eac";
  let followingId = "64379d0516d4a2f034373ead";

  it("should allow a user to follow another user", (done) => {
    chai
      .request(app)
      .put(`/api/follow/${followingId}`)
      .send({ userId: followerId })
      .end(async (err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).equal("User Followed");
        const currUser = await User.findById(followingId);
        expect(currUser.followers).to.include(followerId);
        const userToFollow = await User.findById(followerId);
        expect(userToFollow.followings).to.include(followingId);
        done();
      });
  });
});

describe("API Endpoint: /api/follow/{:id}", () => {
  let followerId = "64379c8516d4a2f034373eac";
  let followingId = "64379d0516d4a2f034373ttt";

  it("should test to follow non existent user", (done) => {
    chai
      .request(app)
      .put(`/api/follow/${followingId}`)
      .send({ userId: followerId })
      .end(async (err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(404);
        expect(res.body)
          .to.have.property("error")
          .to.be.oneOf(["Not Found", "User To Follow Not Found"]);
        done();
      });
  });
});

describe("API Endpoint: /api/follow/{:id}", () => {
  let followerId = "64379c8516d4a2f034373eac";
  let followingId = "64379c8516d4a2f034373eac";

  it("should test to follow oneself", (done) => {
    chai
      .request(app)
      .put(`/api/follow/${followingId}`)
      .send({ userId: followerId })
      .end(async (err, res) => {
        expect(res).to.have.status(400);
        expect(res.body)
          .to.have.property("error")
          .to.equal("You can not follow yourself");
        done();
      });
  });
});

describe("API Endpoint: /api/follow/:id", () => {
  const alreadyFollowedUserId = "64379d0516d4a2f034373ead";
  const followerId = "64379c8516d4a2f034373eac";

  it("should return an error when user tries to follow an already followed user", (done) => {
    chai
      .request(app)
      .put(`/api/follow/${alreadyFollowedUserId}`)
      .send({ userId: followerId })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property("error").to.equal("Already followed");
        done();
      });
  });
});
