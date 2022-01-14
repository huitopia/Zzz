const passport = require("passport");
const kakao = require("./kakaoStrategy");
const User = require("../schemas/users");

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.userId);
  });

  passport.deserializeUser(function (userId, done) {
    User.findOne({ userId: userId }, (err, user) => {
      done(null, user);
    });
  });

  kakao();
};
