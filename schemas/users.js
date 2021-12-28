const mongoose = require('mongoose')
const UserSchema = new mongoose.Schema({
  userIdx: Number,
  userId: String,
  hashedPassword: String,
  loginCnt: Number,
  noticeSet: Boolean,
  createdAt: String
})

module.exports = mongoose.model('User', UserSchema)