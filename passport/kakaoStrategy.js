const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;
const dotenv = require("dotenv");
const User = require("../schemas/users");

dotenv.config();

module.exports = () => {
  passport.use(
    "kakao",
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_ID,
        clientSecret: process.env.KAKAO_SECRET,
        // callbackURL: '/auth/kakao/callback',
        callbackURL: "http://localhost:3000/auth/kakao/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log(`accessToken : ${accessToken}`); // 사용자 인증. restApi 6시간
        // console.log(`사용자 profile: ${JSON.stringify(profile._json)}`); // 일정 기간 동안 다시 인증 절차를 거치지 않고도 액세스 토큰 발급을 받을 수 있게 해 줍니다. 2달
        try {
          const userId = String(profile.id);
          const user = await User.findOne({
            userId,
          }).exec();

          if (user) {
            let loginCnt = user.loginCnt + 1;
            await User.updateOne({ userId }, { $set: { loginCnt } });

            const userToken = {
              userIdx: user.userIdx,
              userId: user.userId,
              noticeSet: user.noticeSet,
              loginCnt,
              accessToken,
              refreshToken,
            };
            done(null, userToken);
            console.log("login", userToken);
          } else {
            const recentUser = await User.find().sort("-userIdx").limit(1);
            let userIdx = 1;
            if (recentUser.length != 0) {
              userIdx = recentUser[0].userIdx + 1;
            }

            let loginCnt = 0;

            const noticeSet = false;

            const createdAt = new Date(+new Date() + 3240 * 10000)
              .toISOString()
              .replace("T", " ")
              .replace(/\..*/, "");

            const newUser = await User.create({
              userIdx,
              userId,
              createdAt,
              loginCnt,
              noticeSet,
            });

            const userToken = {
              userIdx: newUser.userIdx,
              userId: newUser.userId,
              loginCnt: newUser.loginCnt,
              noticeSet: newUser.noticeSet,
              accessToken,
              refreshToken,
            };
            console.log("register", userToken);
            done(null, userToken);
          }
        } catch (err) {
          done(err);
        }
      }
    )
  );
};
