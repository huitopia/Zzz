const mongoose = require('mongoose')
const NoticeSchema = new mongoose.Schema({
  noticeIdx: Number,
  sleepChk: Boolean,
  timePA: Boolean,
  hour: Number,
  min: Number,
  userIdx: Number,
  createdAt: String 
})

module.exports = mongoose.model('Notice', NoticeSchema)