const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;

const User = require("../models/user");

module.exports = () => {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_ID,
        callbackURL: "/user/kakao/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        const {
          id,
          username: name,
          _json: {
            properties: { profile_image },
            kakao_account: { email },
          },
        } = profile;
        try {
          const exUser = await User.findOne({
            where: { snsId: id, provider: "kakao" },
          });
          if (exUser) {
            done(null, exUser);
          } else {
            const newUser = await User.create({
              userId: email,
              name,
              snsId: id,
              provider: "kakao",
              img: profile_image,
            });
            done(null, newUser);
          }
        } catch (error) {
          console.error(error);
          done(error, false, { message: "카카오 서버오류" });
        }
      }
    )
  );
};
