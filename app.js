const express = require("express");
const app = express();
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const userRoute = require("./routes/users");
const authenticateRoute = require("./routes/authenticate");

dotenv.config();

// Connection to MongoDb

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true }).then(() => {
  console.log("Connected to MongoDB..");
});

// Middlewares
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use("/api/user", userRoute);
app.use("/api/authenticate", authenticateRoute);

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
