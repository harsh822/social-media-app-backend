const chai = require("chai");
const chaiHttp = require("chai-http");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const server = require("../app");
const expect = chai.expect;
dotenv.config();

chai.use(chaiHttp);

describe("API Endpoint: /api/authenticate", () => {
  it("should authenticate user with correct credentials", (done) => {
    chai
      .request(server)
      .post("/api/authenticate")
      .send({ email: "abc@g.com", password: "1234567" })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("accessToken");

        // Verify access token with secret token
        const secretToken = process.env.TOKEN_SECRET;
        const decodedToken = jwt.verify(res.body.accessToken, secretToken);
        expect(decodedToken).to.have.property("email").to.equal("abc@g.com");
        done();
      });
  });
});

describe("API Endpoint: /api/authenticate", () => {
  describe("User authentication with Multiple Concurrent Login Attemptss", () => {
    it("should return a unique access token for each concurrent login attempt", async () => {
      const users = [
        {
          email: "abc@g.com",
          password: "1234567",
        },
        {
          email: "xyz@g.com",
          password: "1234567",
        },
        {
          email: "wer@g.com",
          password: "1234567",
        },
      ];

      // Send multiple post requests concurrently
      const responses = await Promise.all(
        users.map(async (user) => {
          const res = await chai
            .request(server)
            .post("/api/authenticate")
            .send(user);
          return res;
        })
      );

      // Check that each response has a unique access token
      const accessTokens = new Set();
      responses.forEach((res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("accessToken");
        accessTokens.add(res.body.accessToken);
      });
      expect(accessTokens.size).to.equal(users.length);
    });
  });
});

describe("API Endpoint: /api/authenticate", () => {
  it("User authentication without email and password", (done) => {
    chai
      .request(server)
      .post("/api/authenticate")
      .send()
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
});

describe("API Endpoint: /api/authenticate", () => {
  it("User authentication with incorrect email or password", (done) => {
    chai
      .request(server)
      .post("/api/authenticate")
      .send({ email: "wer@g.com", password: "1234567df" })
      .end((err, res) => {
        expect(res).to.have.status(403);
        done();
      });
  });
});
