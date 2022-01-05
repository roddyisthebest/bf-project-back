const passport = require("passport");
var GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = require("../models/user");
const md5 = require("md5");

module.exports = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "user/google/callback",
        prompt: "consent",
        scope: ["profile"],
        passReqToCallback: false,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const exUser = await User.findOne({
            where: { snsId: profile.id, provider: "google" },
          });
          if (exUser) {
            done(null, exUser);
          } else {
            const newUser = await User.create({
              name: profile.displayName,
              snsId: profile.id,
              provider: "google",
              img: `https://s.gravatar.com/avatar/${md5(
                profile.id
              )}?s=32&d=retro`,
            });
            console.log(
              `https://s.gravatar.com/avatar/${md5(profile.id)}?s=32&d=retro`
            );
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
