const mongoose = require("mongoose");

const { Schema } = mongoose;

require("dotenv").config();

const UserSchema = new Schema({
  userIdx: { type: Number, required: true },
  userId: { type: String, required: true },
  hashedPassword: { type: String, default: null },
  loginCnt: { type: Number, default: null },
  noticeSet: { type: Boolean, default: null },
  createdAt: { type: String, required: true },
});

module.exports = mongoose.model("User", UserSchema);
