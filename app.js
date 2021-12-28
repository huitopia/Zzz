const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const jwt = require('jsonwebtoken')
const authMiddlewares = require('./middlewares/auth-middleware')

const userRouter = require('./routes/user')
const noticeRouter = require('./routes/notice')

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

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`)
})