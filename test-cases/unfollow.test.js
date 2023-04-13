const chai = require("chai");
const chaiHttp = require("chai-http");
const User = require("../models/User");
const app = require("../app");

chai.use(chaiHttp);
const expect = chai.expect;

describe("API Endpoint: /api/unfollow/{:id}", () => {
  let unfollowerId = "64379c8516d4a2f034373eac";
  let unfollowingId = "64379d0516d4a2f034373ead";

  it("should allow a user to unfollow another user", (done) => {
    chai
      .request(app)
      .put(`/api/unfollow/${unfollowingId}`)
      .send({ userId: unfollowerId })
      .end(async (err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).equal("User Unfollowed");
        const currUser = await User.findById(unfollowingId);
        expect(currUser.followers).to.not.include(unfollowerId);
        const userToFollow = await User.findById(unfollowerId);
        expect(userToFollow.followings).to.not.include(unfollowingId);
        done();
      });
  });
});

describe("API Endpoint: /api/unfollow/{:id}", () => {
  let unfollowerId = "64379c8516d4a2f034373eac";
  let unfollowingId = "64379d0516d4a2f034373ttt";

  it("should test to unfollow non existent user", (done) => {
    chai
      .request(app)
      .put(`/api/follow/${unfollowingId}`)
      .send({ userId: unfollowerId })
      .end(async (err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(404);
        expect(res.body)
          .to.have.property("error")
          .to.be.oneOf(["Not Found", "User To Unfollow Not Found"]);
        done();
      });
  });
});

describe("API Endpoint: /api/unfollow/{:id}", () => {
  let unfollowerId = "64379c8516d4a2f034373eac";
  let unfollowingId = "64379c8516d4a2f034373eac";

  it("should test to unfollow oneself", (done) => {
    chai
      .request(app)
      .put(`/api/unfollow/${unfollowingId}`)
      .send({ userId: unfollowerId })
      .end(async (err, res) => {
        expect(res).to.have.status(400);
        expect(res.body)
          .to.have.property("error")
          .to.equal("You can not unfollow yourself");
        done();
      });
  });
});

describe("API Endpoint: /api/unfollow/:id", () => {
  const alreadyUnfollowedUserId = "64379c8516d4a2f034373eac";
  const unfollowerId = "64379d0516d4a2f034373ead";

  it("should return an error when user tries to unfollow an already unfollowed user", (done) => {
    chai
      .request(app)
      .put(`/api/unfollow/${alreadyUnfollowedUserId}`)
      .send({ userId: unfollowerId })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body)
          .to.have.property("error")
          .to.equal("Already Unfollowed");
        done();
      });
  });
});
