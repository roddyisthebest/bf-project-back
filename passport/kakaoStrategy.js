const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;

const User = require("../models/user");
const Penalty = require("../models/penalty");
const Pray = require("../models/pray");
const Record = require("../models/record");
const moment = require("moment");
module.exports = () => {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_ID,
        callbackURL: "http://localhost:8001/user/kakao/callback",
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
              weekend: moment().day(0).format("YYYY-MM-DD"),
            });
            await Record.create({
              UserId: newUser.id,
              papaer: 0,
              weekend: newUser.weekend,
            });
            await Penalty.create({ UserId: newUser.id });
            await Pray.create({
              content: "default",
              weekend: newUser.weekend,
              UserId: newUser.id,
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
