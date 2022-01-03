const mongoose = require('mongoose')
const DiarySchema = new mongoose.Schema({
  diaryIdx: Number,
  yearMonth: String,
  day: Number,
  feelScore: Number,
  sleepScore: Number,
  scoreAvg: Number,
  comment: String,
  inputDate: String,
  createdAt: String,
  updatedAt: String,
  userIdx: Number
})

module.exports = mongoose.model('Diary', DiarySchema)