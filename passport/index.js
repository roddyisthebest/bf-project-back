const passport = require("passport");
const User = require("../models/user");
const local = require("./localStrategy");
const kakao = require("./kakaoStrategy");
const google = require("./googleStrategy");

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      console.log(id);
      const exUser = await User.findOne({
        where: { id },
        include: [
          { model: User, attributes: ["id", "name"], as: "Followers" },
          { model: User, attributes: ["id", "name"], as: "Followings" },
        ],
      });
      done(null, exUser);
    } catch (err) {
      done(err);
    }
  });

  local();
  kakao();
  google();
};
