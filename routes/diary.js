const express = require('express')
const router = express.Router()
const Diary = require('../schemas/diaries')
const Score = require('../schemas/scores')
const authMiddleware = require('../middlewares/auth-middleware')

router.post('/diary', authMiddleware, async (req, res) => {
  const { year, month, day, feelScore, sleepScore, comment} = req.body
  const { user } = res.locals
  const userIdx = user.userIdx

  try {
    const recentDiary = await Diary.find().sort("-diaryIdx").limit(1)
    let diaryIdx = 1
    if (recentDiary.length !== 0) {
      diaryIdx = recentDiary[0]["diaryIdx"] + 1
    }

    const input = year+"-"+month+"-"+day
    const inputDay = new Date(input)
    const createdAt = new Date(+new Date() + 3240 * 10000).toISOString().replace('T', ' ').replace(/\..*/, '')

    await Diary.create({ diaryIdx, userIdx, year, month, day, feelScore, sleepScore, comment, createdAt, inputDay })
    res.status(201).send({
      result: "수면 기록 등록 완료"
    })
    return
  } catch (error) {
    res.status(400).send({
      errorMessage: "수면 기록 등록 중 오류 발생"
    })
    return
  }
})

module.exports = router