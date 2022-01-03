const express = require('express')
const router = express.Router()
const moment = require('moment')
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
    let inputDate = moment(input).format('YYYY-MM-DD')
    const createdAt = new Date(+new Date() + 3240 * 10000).toISOString().replace('T', ' ').replace(/\..*/, '')
    let scoreAvg = feelScore + sleepScore

    await Diary.create({ diaryIdx, userIdx, yearMonth, day, feelScore, sleepScore, comment, createdAt, inputDate, scoreAvg })
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
  const { userIdx } = req.params
  const { yearMonth } = req.body
  const { user } = res.locals
  try {
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
      // DB 가져옴
      const monthDiary = await Diary.find({ userIdx: userIdx }
        , { _id: 0, yearMonth: 1, day: 1, scoreAvg: 1, inputDate: 1 }).sort("day")// [{ yearMonth: '2022-1', day: 1, sleepScore: 4 }]
      const scoreObj = { monthDiary } //{monthDiary: [{ yearMonth: '2022-1', day: 1, sleepScore: 4 }]}

      let nowDate = new Date(+new Date() + 3240 * 10000) // 현재 날짜 yyyymmdd
      let nowDateForm = moment(nowDate).format('YYYY-MM-DD') // 2022-01-03
      let nowDay = nowDate.getDay() // 현재 요일 받기 1

      function zero(nowDay) {
        let result = ""
        let arrDbDate = new Array // DB중 day 배열에 넣기
        for (let a = 0; a < scoreObj.monthDiary.length; a++) {
          arrDbDate.push(scoreObj.monthDiary[a].inputDate)
        }
        // console.log(arrDbDate);

        // 이번주
        let thisMonDd = nowDate.getDate() - nowDay + 1 // 이번주 월요일의 날짜
        let nowDdForm = Number(moment().format('DD')) // 현재 날짜
        let thisBetween = nowDdForm - thisMonDd
        let thisMonDate = new Date(+new Date() + 3240 * 10000);
        thisMonDate.setDate(thisMonDate.getDate() - nowDay + 1) // 2022-01-03 Date 형식
        let thisMonDateForm = moment(thisMonDate).format('YYYY-MM-DD') // 이번주 월요일 YYYY-MM-DD 형식 변환

        let arrThisWeek = new Array // 이번주 월요일부터 현재 arr에 담기
        for (let b = 0; b <= thisBetween; b++) {
          let bThis = moment(thisMonDateForm).add(b, 'days').format('YYYY-MM-DD')
          arrThisWeek.push(bThis)
        }
        // console.log(arrThisWeek);

        let thisWeekDb = arrThisWeek.filter(x => arrDbDate.includes(x)) // 이번주 기록 dd 찾기(교집합)
        // console.log(thisWeekDb);

        if (thisWeekDb.length === 0) {
          result += "이번주 기록이 없어요 8ㅅ8"
        } else {
          // 저번주
          let lastMonDate = moment().subtract(nowDay + 6, 'days').format('YYYY-MM-DD') // 2021-12-27
          // let lastSunDate = moment().subtract(nowDay, 'days').format('YYYY-MM-DD') // 2021-01-02
          let arrLastWeek = new Array() // 저번주 1주일 배열로 만들어 나열
          for (let c = 0; c < 7; c++) {
            let bLast = moment(lastMonDate).add(c, 'days').format('YYYY-MM-DD')
            arrLastWeek.push(bLast)
          }
          // console.log(arrLastWeek);

          let lastWeekDb = arrLastWeek.filter(x => arrDbDate.includes(x)) // 저번주 기록 dd 찾기(교집합)
          // console.log(lastWeekDb);

          if (lastWeekDb.length === 0) {
            result += "저번주 기록이 없어요 8ㅅ8"
          } else {
            let arrThisScore = new Array // this dd 해당하는 score 가져와 배열에 담기
            for (const d of thisWeekDb) {
              let thisPicDay = monthDiary.filter(function (pic1) {
                return pic1.inputDate == String(d)
              });
              let thisPic = thisPicDay[0].scoreAvg
              arrThisScore.push(thisPic)
            }
            // console.log(arrThisScore);

            let thisPicScore = arrThisScore.reduce(function add(sum, currVale) {
              return sum + currVale
            }, 0)
            let thisAvg = (thisPicScore / arrThisScore.length).toFixed(1) // this 누적 평균
            // console.log(thisAvg); 4.0
            let arrLastScore = new Array // last dd 해당하는 score 가져와 배열에 담기
            for (const e of lastWeekDb) {
              let lastPicDay = monthDiary.filter(function (pic2) {
                return pic2.inputDate == String(e)
              });
              // console.log(lastPicDay);
              let lastPic = lastPicDay[0].scoreAvg
              arrLastScore.push(lastPic)
            }
            // console.log(arrLastScore);

            let lastPicScore = arrLastScore.reduce(function add(sum, currVale) {
              return sum + currVale
            }, 0)
            let lastAvg = (lastPicScore / arrLastScore.length).toFixed(1) // last 누적 평균
            // console.log(lastAvg); 3.8

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
        return result
      }
      let sleepAvg = zero(nowDay)
      const getDiary = await Diary.find({ userIdx: userIdx, yearMonth: yearMonth }
        , { _id: 0, diaryIdx: 1, day: 1, feelScore: 1, sleepScore: 1, comment: 1 }).sort("day")
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

router.put('/diary/:diaryIdx', authMiddleware, async (req, res) => {
  const { diaryIdx } = req.params
  const { user } = res.locals
  const { feelScore, sleepScore, comment } = req.body

  try {
    const diaryUser = await Diary.findOne({ diaryIdx })
    const tokenUser = user.userIdx
    const dbUser = diaryUser["userIdx"]

    if (tokenUser == dbUser) {
      let scoreAvg = feelScore + sleepScore
      const updatedAt = new Date(+new Date() + 3240 * 10000).toISOString().replace('T', ' ').replace(/\..*/, '')
      await Diary.updateOne({ diaryIdx }, { $set: { feelScore, sleepScore, comment, scoreAvg, updatedAt } })
      res.status(200).send({
        result: "기록 수정 완료"
      })
      return
    } else {
      res.status(401).send({
        errorMessage: "권한 없음"
      })
      return
    }
  } catch (error) {
    res.status(400).send({
      errorMessage: "기록 수정 중 오류가 발생했습니다."
    })
  }
})

router.delete('/diary/:diaryIdx', authMiddleware, async (req, res) => {
  const { diaryIdx } = req.params
  const { user } = res.locals

  try {
    const diaryUser = await Diary.findOne({ diaryIdx })
    const tokenUser = user.userIdx
    const dbUser = diaryUser["userIdx"]

    if (tokenUser === dbUser) {
      await Diary.deleteOne({ diaryIdx })
      res.status(200).send({
        result: "기록 삭제 완료"
      })
      return
    } else {
      res.status(401).send({
        errorMessage: "권한 없음"
      })
      return
    }
  } catch (error) {
    res.status(400).send({
      errorMessage: "기록 삭제 중 오류가 발생했습니다."
    })
  }
})

module.exports = router