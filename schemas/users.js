const mongoose = require('mongoose')
const UserSchema = new mongoose.Schema({
  userIdx: Number,
  userId: String,
  hashedPassword: String,
  loginCnt: Number,
  createdAt: String
})

module.exports = mongoose.model('User', UserSchema)