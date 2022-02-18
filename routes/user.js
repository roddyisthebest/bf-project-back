const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const md5 = require("md5");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const db = require("../models");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");

const { Op } = require("sequelize");
const moment = require("moment");
const { User } = require("../models");

const router = express.Router();

router.get("/", isLoggedIn, async (req, res, next) => {
  const user = req.user;
  res.json(user);
});

const upload_user = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, `uploads/user-img`);
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
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
    await db.Record.create({
      UserId: user.id,
      papaer: 0,
      weekend: user.weekend,
    });
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
      attributes: [
        "id",
        "userId",
        "name",
        "img",
        "provider",
        "createdAt",
        "background",
      ],
      include: [
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

router.post(
  "/img/:type",
  isLoggedIn,
  upload_user.single("img"),
  async (req, res, next) => {
    const { type } = req.params;
    try {
      if (type == "background") {
        const background = req.user.background;
        await User.update(
          { background: `/img/user-img/${req.file.filename}` },
          { where: { id: req.user.id } }
        );
        if (req.user.background != "") {
          fs.unlink(background.replace("img", "uploads").substring(1), (err) =>
            err ? console.error(err) : console.log("사진이 성공적으로 삭제")
          );
        }
      } else {
        const img = req.user.img;
        await User.update(
          { img: `http://localhost:8001/img/user-img/${req.file.filename}` },
          { where: { id: req.user.id } }
        );
        fs.unlink(img.replace("img", "uploads").substring(22), (err) =>
          err ? console.error(err) : console.log("사진이 성공적으로 삭제")
        );
      }

      return res.json({
        code: 200,
        message: "회원님의 사진정보가 성공적으로 바뀌었습니다.",
        meta:
          type != "background"
            ? `http://localhost:8001/img/user-img/${req.file.filename}`
            : `/img/user-img/${req.file.filename}`,
      });
    } catch (e) {
      console.log(e);
      return next(e);
    }
  }
);

router.put("/", isLoggedIn, async (req, res, next) => {
  const { userId, pw, name } = req.body;
  const condition = {};
  if (userId) {
    condition.userId = userId;
  }
  if (pw) {
    condition.pw = await bcrypt.hash(pw, 12);
  }
  if (name) {
    condition.name = name;
  }
  try {
    await db.User.update(condition, { where: { id: req.user.id } });
    return res.json({
      code: 200,
      message: "회원정보가 성공적으로 변경되었습니다.",
      meta: name,
    });
  } catch (e) {
    console.log(e);
    return next(e);
  }
});

router.post("/back/reset", isLoggedIn, async (req, res, next) => {
  try {
    await User.update({ background: "" }, { where: { id: req.user.id } });
    if (req.user.background != "") {
      fs.unlink(
        req.user.background.replace("img", "uploads").substring(1),
        (err) =>
          err ? console.error(err) : console.log("사진이 성공적으로 삭제")
      );
    }
    res.json({
      code: 200,
      message: "회원님의 background가 기본화면으로 바뀌었습니다.",
    });
  } catch (e) {
    console.log(e);
    return next(e);
  }
});

router.post("/follow", isLoggedIn, async (req, res, next) => {
  const { isFollow, id } = req.body;
  try {
    const user = await db.User.findOne({ where: { id: req.user.id } });
    if (user) {
      if (isFollow) {
        await user.addFollowing(parseInt(id, 10));
        return res.json({
          code: 200,
          message: "성공적으로 팔로우 처리 되었습니다.",
        });
      } else {
        await user.removeFollowing(parseInt(id, 10));
        return res.json({
          code: 200,
          message: "성공적으로 팔로우 취소 되었습니다.",
        });
      }
    } else {
      return res.status(403).json({ code: 403, message: "잘못된 접근입니다." });
    }
  } catch (e) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
