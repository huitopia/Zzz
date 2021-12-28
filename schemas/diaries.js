const mongoose = require('mongoose')
const DiarySchema = new mongoose.Schema({
  diaryIdx: Number,
  year: String,
  month: String,
  day: String,
  feelScore: Number,
  sleepScore: Number,
  comment: String,
  inputDay: Date,
  createdAt: String,
  updatedAt: String,
  userIdx: Number
})

module.exports = mongoose.model('Diary', DiarySchema)