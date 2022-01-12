const express = require('express');
const bodyParser = require('body-parser');
const passportConfig = require('./passport');
const cors = require('cors');

const app = express();
app.use(cors());
passportConfig();
const passport = require('passport');
const session = require('express-session');
const port = 3000;
const path = require('path');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config();

const userRouter = require('./routes/user');
const noticeRouter = require('./routes/notice');
const diaryRouter = require('./routes/diary');
const asmrRouter = require('./routes/asmr');
const scoresRouter = require('./routes/score');
const authRouter = require('./routes/auth');

// const MongoStore = require('connect-mongo');
const connect = require('./schemas');

connect();

app.use(morgan('dev')); // 개발
// app.use(morgan('combined')) // 배포
app.use(bodyParser.urlencoded({ extended: false })); // app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json()); // app.use(express.json());
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: true,
    // store: MongoStore.create({
    //   mongoUrl: 'mongodb://localhost:27017/zzz',
    // }),
  }),
);
// app.use(session);
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.send('hello zzz');
});
app.use('/api', express.urlencoded({ extended: false }), userRouter);
app.use('/api', express.urlencoded({ extended: false }), noticeRouter);
app.use('/api', express.urlencoded({ extended: false }), diaryRouter);
app.use('/api/asmr', express.urlencoded({ extended: false }), asmrRouter);
app.use('/api', express.urlencoded({ extended: false }), scoresRouter);
app.use('/auth', express.urlencoded({ extended: false }), authRouter);

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});
