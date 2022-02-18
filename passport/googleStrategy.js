const passport = require("passport");
var GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = require("../models/user");
const Penalty = require("../models/penalty");
const Pray = require("../models/pray");
const Record = require("../models/record");

const md5 = require("md5");
const moment = require("moment");

module.exports = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:8001/user/google/callback",
        prompt: "consent",
        scope: ["profile"],
        passReqToCallback: false,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        console.log(profile);
        try {
          const exUser = await User.findOne({
            where: { snsId: profile.id, provider: "google" },
          });
          if (exUser) {
            done(null, exUser);
          } else {
            const newUser = await User.create({
              userId: "google",
              name: profile.displayName,
              snsId: profile.id,
              provider: "google",
              img: profile.photos[0].value,
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
        } catch (e) {
          console.error(e);
          done(e, false, { message: "구글 서버오류" });
        }
      }
    )
  );
};
