const express = require('express');
const { JsonWebTokenError } = require('jsonwebtoken');
const router = express.Router();
const passport = require('passport');
const kakaoStrategy = require('../passport/kakaoStrategy');

const User = require('../schemas/users');

// id를 세션 저장소에 저장하고 deserializeUser로 넘어감
// passport.serializeUser(function (user, done) {
//   done(null, user.userId);
// });
// Client 요청시 항상 실행되는 미들웨어, 세션 저장소에서 id를 가져와 유저 정보를 DB에서 찾아 req.user를 통해 사용
// passport.deserializeUser(function (userId, done) {
//   User.findOne({ userId: userId }, (err, user) => {
//     done(null, user);
//   });
// });

// logout
router.get('/logout', async (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

router.get('/kakao', passport.authenticate('kakao'));

// login
router.get(
  '/kakao/callback',
  passport.authenticate('kakao', {
    failureRedirect: '/',
  }),
  (req, res) => {
    try {
      const token = req.user.userId;
      res.redirect('/' + token);
    } catch (err) {
      res.status(400).send({
        errorMessage: '로그인 실행 중 에러가 발생하였습니다.',
      });
    }
  },
);

module.exports = router;
