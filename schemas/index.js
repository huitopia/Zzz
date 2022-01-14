const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
// require("dotenv").config();
const production = process.env.PRODUCTION;
const dev1 = process.env.DEV;
const connect = () => {
  // PRODUCTION = "mongodb://test:test@54.180.109.58:27017"
  // DEV = "mongodb://localhost/hanghae4"
  mongoose
    .connect(production, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .catch((err) => console.log(err));
};

mongoose.connection.on("error", (err) => {
  console.error("몽고디비 연결 에러", err);
});

// test
module.exports = connect;
