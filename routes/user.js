const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const md5 = require("md5");

const db = require("../models");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");

const { Op } = require("sequelize");
const moment = require("moment");

const router = express.Router();

router.get("/", isLoggedIn, async (req, res, next) => {
  const user = req.user;
  res.json(user);
});

// 회원가입
router.post("/", isNotLoggedIn, async (req, res, next) => {
  const { userId, password, name } = req.body;
  try {
    const exUser = await db.User.findOne({
      where: {
        [Op.or]: [{ userId }, { name }],
      },
    });

    if (exUser) {
      return res.status(403).json({
        code: 403,
        message: "이미 회원가입 되었거나 이름이 중복된 유저가 존재합니다.",
      });
    }

    const hash = await bcrypt.hash(password, 12);

    const user = await db.User.create({
      userId,
      password: hash,
      name,
      img: `https://s.gravatar.com/avatar/${md5(userId)}?s=32&d=retro`,
      weekend: moment().day(0).format("YYYY-MM-DD"),
    });

    await db.Penalty.create({ UserId: user.id });
    await db.Pray.create({
      content: "default",
      weekend: user.weekend,
      UserId: user.id,
    });

    return res.send({
      code: 200,
      meta: { name: user.name },
      message: "유저가 등록되었습니다.",
    });
  } catch (e) {
    console.log(e);
    return next(e);
  }
});

router.post("/login", isNotLoggedIn, (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.log(err);
      return next(err);
    }
    if (info) {
      return res.status(401).send(info.message);
    }
    return req.login(user, async (err) => {
      if (err) {
        console.error(err);
        return next(err);
      }

      const fullUser = await db.User.findOne({
        where: { id: user.id },
        attributes: ["id", "userId", "name"],
        include: [
          {
            model: db.Post,
            attributes: ["id"],
          },
          {
            model: db.User,
            as: "Followings",
            attributes: ["id"],
          },
          {
            model: db.User,
            as: "Followers",
            attributes: ["id"],
          },
        ],
      });
      return res.json(fullUser);
    });
  })(req, res, next);
});

router.post("/logout", isLoggedIn, (req, res) => {
  // 실제 주소는 /user/logout
  if (req.isAuthenticated()) {
    req.logout();
    req.session.destroy(); // 선택사항
    return res.send({
      code: 200,
      message: "로그아웃 되었습니다.",
    });
  }
});

router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.redirect(`http://localhost:8080/error/${info.message}`);
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.log(loginError);
        return next(loginError);
      }
      return res.redirect("http://localhost:8080/login");
    });
  })(req, res, next);
});

router.get("/kakao/callback", (req, res, next) => {
  passport.authenticate("kakao", (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.redirect(`http://localhost:8080/error/${info.message}`);
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.log(loginError);
        return next(loginError);
      }
      return res.redirect("http://localhost:8080/login");
    });
  })(req, res, next);
});

router.get("/:id", isLoggedIn, async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await db.User.findOne({
      where: { id },
      attributes: ["id", "userId", "name", "img", "provider", "createdAt"],
    });
    if (user) {
      return res.json({ code: 200, meta: user });
    } else {
      return res.json({ code: 404, message: "해당되는 유저가 없습니다." });
    }
  } catch (e) {
    console.error(e);
    return next(e);
  }
});
module.exports = router;
