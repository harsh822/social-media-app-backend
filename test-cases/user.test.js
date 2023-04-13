const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");

chai.use(chaiHttp);
const expect = chai.expect;

describe("API Endpoint: /api/user", function () {
  let validAccessToken;

  before(function (done) {
    chai
      .request(app)
      .post("/api/authenticate")
      .send({ email: "first@g.com", password: "1234567" })
      .end(function (err, res) {
        validAccessToken = res.body.accessToken;
        done();
      });
  });
  it("should return user information for authenticated user", function (done) {
    chai
      .request(app)
      .get("/api/user")
      .set("Authorization", "Bearer " + validAccessToken)
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("username");
        expect(res.body).to.have.property("numberOfFollowers");
        expect(res.body).to.have.property("Followings");
        done();
      });
  });
});

describe("API Endpoint: /api/user", function () {
  let validAccessToken;

  before(function (done) {
    chai
      .request(app)
      .post("/api/authenticate")
      .send({ email: "invalid@g.com", password: "1234567" })
      .end(function (err, res) {
        validAccessToken = res.body.accessToken;
        done();
      });
  });
  it("should return unauthorized error for invalid user id", function (done) {
    chai
      .request(app)
      .get("/api/user")
      .set("Authorization", "Bearer " + validAccessToken) // Replace with valid access token
      .end(function (err, res) {
        expect(res).to.have.status(401);
        done();
      });
  });
});
