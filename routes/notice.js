const express = require('express')
const router = express.Router()
const Notice = require('../schemas/notice')
const User = require('../schemas/users')
const authMiddleware = require('../middlewares/auth-middleware')

// 알람 팝업 등록
router.post('/notice', authMiddleware, async (req, res) => {
  const { sleepChk, timePA, hour, min } = req.body
  const { user } = res.locals
  const userIdx = user.userIdx

  try {
    const recentNotice = await Notice.find().sort("-noticeIdx").limit(1)
    let noticeIdx = 1
    if (recentNotice.length !== 0) {
      noticeIdx = recentNotice[0]["noticeIdx"] + 1
    }

    const createdAt = new Date(+new Date() + 3240 * 10000).toISOString().replace('T', ' ').replace(/\..*/, '')

    await Notice.create({ noticeIdx, userIdx, sleepChk, timePA, hour, min, createdAt })
    await User.updateOne({ userIdx }, { $set: { noticeSet: true } })
    res.status(201).send({
      result: "알람 설정 완료"
    })
    return
  } catch (error) {
    res.status(400).send({
      errorMessage: "알람 등록 중 오류 발생"
    })
    return
  }
})

// 알람 정보
router.get('/notice/:userIdx', authMiddleware, async (req, res) => {
  const { userIdx } = req.params
  const { user } = res.locals // 토큰 user
  const noticeUser = await Notice.findOne({ userIdx }) // param으로 notice.userIdx
  const tokenUser = user.userIdx
  const dbUser = noticeUser["userIdx"]

  try {
    if (tokenUser === dbUser) {
      const notice = await Notice.find({ userIdx: userIdx }
        , { _id: 0, noticeIdx: 1, sleepChk: 1, timePA: 1, hour: 1, min: 1, createdAt: 1})
      res.status(200).send(notice)
    } else {
      res.status(403).send({
        errorMessage: "권한 없음"
      })
    }
    return
  } catch (error) {
    res.status(400).send({
      errorMessage: "정보 불러오기 중 오류 발생"
    })
    return
  }
})

router.put('/notice/:userIdx', authMiddleware, async (req, res) => {
  const { userIdx } = req.params
  const { sleepChk, timePA, hour, min } = req.body
  const { user } = res.locals // 토큰 user
  const noticeUser = await Notice.findOne({ userIdx }) // param으로 notice.userIdx
  const tokenUser = user.userIdx
  const dbUser = noticeUser["userIdx"]

  try {
    if (tokenUser === dbUser) {
      await Notice.updateOne({ userIdx }, { $set: { sleepChk, timePA, hour, min } })
      res.status(201).send({
        result: "알람 정보 수정 완료"
      })
    } else {
      res.status(403).send({
        errorMessage: "권한 없음"
      })
    }
    return
  } catch (error) {
    res.status(400).send({
      errorMessage: "알람 정보 수정 중 오류 발생"
    })
    return
  }
})



module.exports = router