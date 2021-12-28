const mongoose = require('mongoose')
const ScoreSchema = new mongoose.Schema({
  avgIdx: Number,
  sleepAvg: Number,
  period: String,
  userIdx: Number
})

module.exports = mongoose.model('Score', ScoreSchema)