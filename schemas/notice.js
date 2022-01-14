const mongoose = require("mongoose");

const { Schema } = mongoose;

require("dotenv").config();

const NoticeSchema = new Schema({
  noticeIdx: { type: Number, required: true },
  sleepChk: { type: Boolean, required: true },
  timePA: { type: String, default: null },
  hour: { type: Number, default: null },
  min: { type: Number, default: null },
  createdAt: { type: String, required: true },
  userIdx: { type: Number, required: true },
});

module.exports = mongoose.model("Notice", NoticeSchema);
