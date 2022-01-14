const mongoose = require("mongoose");

const { Schema } = mongoose;

require("dotenv").config();

const DiarySchema = new Schema({
  diaryIdx: { type: Number, required: true },
  yearMonth: { type: String, required: true },
  day: { type: Number, required: true },
  feelScore: { type: Number, required: true },
  sleepScore: { type: Number, required: true },
  scoreAvg: { type: Number, required: true },
  comment: { type: String, default: null },
  inputDate: { type: String, required: true },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, default: null },
  userIdx: { type: Number, required: true },
});

module.exports = mongoose.model("Diary", DiarySchema);
