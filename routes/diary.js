const express = require('express')
const router = express.Router()
const Diary = require('../schemas/diaries')
const Score = require('../schemas/scores')
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

    const input = yearMonth + "-" + day
    const inputDay = new Date(input)
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
  const { userIdx } = req.params
  const { yearMonth } = req.body
  const { user } = res.locals
  const diaryUser = await Diary.findOne({ userIdx })
  const tokenUser = user.userIdx
  const dbUser = diaryUser["userIdx"]

  // 오늘 날짜 받기
  let nowDate = new Date(+new Date() + 3240 * 10000)
  let nowDay = nowDate.getDay()
  // console.log(nowDay);
  // console.log(nowDate.getDate() - nowDay) // 7일뒤 날짜

  // 저번주 합계 구하기
  // 오늘 기준으로 저번주가 언제인지 구해야함
  // 저번주 월요일 = nowDate.getDate() - nowDay - 7
  let lastWeekMonDay = nowDate.getDate() - nowDay - 6
  // 저번주 일요일 = nowDate.getDate() - nowDay
  let lastWeekSunDay = nowDate.getDate() - nowDay
  // console.log(lastWeekMonDay, lastWeekSunDay); //20, 26

  // 20~26일 구해서 배열 쳐넣기
  let arrLastWeekDay = new Array
  for (let i = lastWeekMonDay; i <= lastWeekSunDay; i++) {
    arrLastWeekDay.push(i)
  }
  // console.log(arrLastWeekDay); // [20,21,22,23,24,25,26]

  // 배열의 값 db에서 찾아서 다 뽑아내기
  const scoreDiary = await Diary.find({ userIdx: userIdx, yearMonth: yearMonth }
    , { _id: 0, day: 1, feelScore: 1}).sort("inputDay")
  console.log(scoreDiary); //object
  const scoreObj = {scoreDiary} // 객체 안 객체 만들기
  // console.log(scoreObj); // {[{key: value}]}
  // console.log(typeof scoreObj); // object


  // 객체 day 배열에 넣기
  let arrDbDay = new Array
  for (let j = 0; j < scoreObj.scoreDiary.length; j++) {
    arrDbDay.push(parseInt(scoreObj.scoreDiary[j].day))
  }
  console.log(arrDbDay); //[20,21,23,25,26,27]

  // 지난주 day에 기록한 day가 있는지 = 교집합 찾기
  let intersectionDay = arrLastWeekDay.filter(x => arrDbDay.includes(x))
  console.log(intersectionDay); // [20,21,23,25,26]


  // day에 해당하는 score 가져와 배열에 담기
  let arrPicScore = new Array
  for (const k of intersectionDay) {
    let picDayScore = scoreDiary.filter(function (pic) { return pic.day == String(k) });
    let picScore = picDayScore[0].feelScore
    // console.log(picScore); // 1
    arrPicScore.push(picScore)
  }
  // console.log(arrPicScore); // 2,5,1,2,4

  // score 누적 평균 구하기
  let picScoreResult = arrPicScore.reduce(function add(sum, currValue) {
    return sum + currValue
  }, 0)
  // console.log(picScoreResult); // 14
  let picScoreAvg = picScoreResult / arrPicScore.length
  // console.log(picScoreAvg); // 2.8


  // 통계
  // 문자열 변경
  // let toMon = String(lastWeekMonDay)

  // 월요일 ~ 일요일 userIdx 기준 sleepScore 찾아서 합계
  // 저번주 합계가 없으면 0% 반환
  // 이번주 합계 구하기
  // 저번주 - 이번주 백분율 내기
  // 그러나 월요일이면 0% 반환
  // 이번주 기록이 없으면 0% 반환
  // let avg = " "
  function zero(nowDay) {
    let result = 0;
    if (nowDay === 1) {
      result = 0
    } else {

    }
    return result;
  }
  // console.log(zero(nowDay));


  try {
    if (tokenUser === dbUser) {

      const monthDiary = await Diary.find({ userIdx: userIdx, yearMonth: yearMonth }
        , { _id: 0, day: 1, feelScore: 1, sleepScore: 1, comment: 1 }).sort("inputDay")
      res.status(200).send(monthDiary)
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

module.exports = router