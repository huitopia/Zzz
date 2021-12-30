const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
const port = 3000
const path = require('path')
const jwt = require('jsonwebtoken')
const authMiddlewares = require('./middlewares/auth-middleware')

const userRouter = require('./routes/user')
const noticeRouter = require('./routes/notice')
const diaryRouter = require('./routes/diary')

const connect = require('./schemas')
connect()

app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, "public")))
app.use(express.json())

app.get("/", (req, res) => {
  res.send("hello zzz")
})
app.use('/api', express.urlencoded({ extended: false }), userRouter)
app.use('/api', express.urlencoded({ extended: false }), noticeRouter)
app.use('/api', express.urlencoded({ extended: false }), diaryRouter)

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`)
})