const express = require('express')
const router = express.Router()
const Diary = require('../schemas/diaries')
const authMiddleware = require('../middlewares/auth-middleware')

router.post('/diary', authMiddleware, async (req, res) => {
  const { yearMonth, day, feelScore, sleepScore, comment } = req.body
  const { user } = res.locals
  const userIdx = user.userIdx

  try {
    const recentDiary = await Diary.find().sort("-diaryIdx").limit(1)
    let diaryIdx = 1
    if (recentDiary.length !== 0) {
      diaryIdx = recentDiary[0]["diaryIdx"] + 1
    }

    const input = yearMonth + "-" + String(day)
    const inputDayHh = new Date(input)
    const inputDay = inputDayHh.setHours(inputDayHh.getHours() + 9)
    const createdAt = new Date(+new Date() + 3240 * 10000).toISOString().replace('T', ' ').replace(/\..*/, '')

    await Diary.create({ diaryIdx, userIdx, yearMonth, day, feelScore, sleepScore, comment, createdAt, inputDay })
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

router.get('/diary/:userIdx', authMiddleware, async (req, res) => {
  try {
    const { userIdx } = req.params
    const { yearMonth } = req.body
    const { user } = res.locals

    let arrIdx = [parseInt(userIdx)] // Diary schema에 DB 존재하는지 파악
    const userIdxDb = await Diary.find({ userIdx: userIdx }, { _id: 0, userIdx: 1 }).exec()
    const userIdxDbobj = { userIdxDb }
    let arrIdxDb = new Array
    for (let z = 0; z < userIdxDbobj.userIdxDb.length; z++) {
      arrIdxDb.push(parseInt(userIdxDbobj.userIdxDb[z].userIdx))
    }
    let intersectionIdx = arrIdxDb.filter(x => arrIdx.includes(x))

    if (intersectionIdx.length === 0) {
      res.status(206).send({
        errorMessage: "기록 없는 유저"
      })
      return
    }

    const diaryUser = await Diary.findOne({ userIdx })
    const tokenUser = user.userIdx
    const dbUser = diaryUser["userIdx"]
    if (tokenUser === dbUser) {
      const monthDiary = await Diary.find({ userIdx: userIdx}
        , { _id: 0, yearMonth: 1, day: 1, feelScore: 1 }).sort("day")
      const scoreObj = { monthDiary }

      let nowDate = new Date(+new Date() + 3240 * 10000) // 현재 날짜 yyyymmdd
      let nowDay = nowDate.getDay() // 현재 요일 받기

      function zero(nowDay) {
        let result = ""
        if (nowDay === 1) {
          result += "오늘은 월요일 코드 안 줌!"
        } else {
          let arrDbDay = new Array // DB중 day 배열에 넣기
          for (let a = 0; a < scoreObj.monthDiary.length; a++) {
            arrDbDay.push(parseInt(scoreObj.monthDiary[a].day))
          }
          // 이번주
          let thisMonDate = nowDate.getDate() - nowDay + 1
          let thisDate = nowDate.getDate()

          let thisMonDate1 = new Date(+new Date() + 3240 * 10000);
          thisMonDate1.setDate(thisMonDate1.getDate() - nowDay + 1)
          console.log(thisMonDate);
          console.log(thisMonDate1);

          let arrThisWeek = new Array // 이번주 dd 배열로 만들어 나열
          for (let b = thisMonDate; b <= thisDate; b++) {
            arrThisWeek.push(b)
          }
          

          let thisWeekDb = arrThisWeek.filter(x => arrDbDay.includes(x)) // 이번주 기록 dd 찾기(교집합)

          if (thisWeekDb.length === 0) {
            result += "이번주 기록한 디비 없어요!"
          } else {
            // 저번주
            let lastMonDate = nowDate.getDate() - nowDay - 6
            let lastSunDate = nowDate.getDate() - nowDay
            let arrLastWeek = new Array // 저번주 dd 배열로 만들어 나열
            for (let c = lastMonDate; c <= lastSunDate; c++) {
              arrLastWeek.push(c)
            }

            let lastWeekDb = arrLastWeek.filter(x => arrDbDay.includes(x)) // 저번주 기록 dd 찾기(교집합)

            if (lastWeekDb.length < 1) {
              result += "저번주 기록한 디비 없어요"
            } else {
              let arrThisScore = new Array // this dd 해당하는 score 가져와 배열에 담기
              for (const d of thisWeekDb) {
                let thisPicDay = monthDiary.filter(function (pic1) {
                  return pic1.day == String(d)
                });
                let thisPic = thisPicDay[0].sleepScore
                arrThisScore.push(thisPic)
              }

              let thisPicScore = arrThisScore.reduce(function add(sum, currVale) {
                return sum + currVale
              }, 0)
              let thisAvg = (thisPicScore / arrThisScore.length).toFixed(1) // this 누적 평균

              let arrLastScore = new Array // last dd 해당하는 score 가져와 배열에 담기
              for (const e of lastWeekDb) {
                let lastPicDay = monthDiary.filter(function (pic2) {
                  return pic2.day == String(e)
                });
                let lastPic = lastPicDay[0].sleepScore
                arrLastScore.push(lastPic)
              }

              let lastPicScore = arrLastScore.reduce(function add(sum, currVale) {
                return sum + currVale
              }, 0)
              let lastAvg = (lastPicScore / arrLastScore.length).toFixed(1) // last 누적 평균

              //  4/2 = 2배, *100 = 200% || *100 -100 = 100%
              if (lastAvg > thisAvg) {
                let lastA = lastAvg / thisAvg * 100 - 100
                result += "저번주가 이번주 보다 " + parseInt(lastA) + "% 잠을 더 잘 주무셨네요"
              } else if (lastAvg === thisAvg) {
                result += "오늘은 저번주보다 더 잘 자기로 해요"
              } else {
                let thisA = thisAvg / lastAvg * 100 - 100
                result += "저번주보다 " + parseInt(thisA) + "% 잠을 더 잘 주무셨네요"
              }
            }
          }
        }
        return result
      }
      let sleepAvg = zero(nowDay)
      const getDiary = await Diary.find({ userIdx: userIdx, yearMonth: yearMonth }
        , { _id: 0, day: 1, feelScore: 1, sleepScore: 1, comment: 1 }).sort("day")
      res.status(200).send({ getDiary, sleepAvg })
    } else {
      res.status(403).send({
        errorMessage: "권한 없음"
      })
    }
    return
  } catch (error) {
    res.status(400).send({
      errorMessage: "수면 기록 불러오기 중 오류 발생"
    })
    return
  }
})

// router.delete('/diary/:userIdx', authMiddleware, async(req, res) => {
//   const userIdx = req.params
//   const { inputDay } = req.body
//   const { user } = res.locals

// })

module.exports = router