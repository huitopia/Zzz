const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

const production = process.env.PRODUCTION
const dev1 = process.env.DEV

const connect = () => {
  mongoose.connect(dev1,{
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).catch((err) => console.log((err)))
}

mongoose.connection.on('error', (err) => {
  console.error('몽고디비 연결 에러', err)
})

module.exports = connect