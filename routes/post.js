const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { isLoggedIn } = require("./middlewares");
const { Tweet, User } = require("../models");
const { Op } = require("sequelize");
const moment = require("moment");

const router = express.Router();

try {
  fs.readdirSync("uploads");
} catch (error) {
  fs.mkdirSync("uploads");
}

const upload_tweet = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, `uploads/tweet-img`);
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/img", isLoggedIn, upload_tweet.single("img"), (req, res) => {
  console.log(req.file);
  res.json({
    code: 200,
    meta: `/img/tweet-img/${req.file.filename}`,
  });
});

router.post("/img/delete", isLoggedIn, (req, res, next) => {
  fs.unlink(req.body.filePath.replace("img", "uploads").substring(1), (err) =>
    err
      ? res.status(404).send({ code: 404, message: err })
      : res.json({ code: 200, message: "성공적으로 삭제띠!" })
  );
});

router.post("/tweet", isLoggedIn, async (req, res, next) => {
  const { content, img } = req.body;
  try {
    const user = await User.findOne({
      where: {
        id: req.user.id,
      },
    });
    var error = false;

    const alreadyTweet = await Tweet.findOne({
      where: {
        UserId: req.user.id,
        createdAt: {
          [Op.between]: [
            moment().format("YYYY-MM-DD 00:00"),
            moment().format("YYYY-MM-DD 23:59"),
          ],
        },
      },
    });

    if (alreadyTweet) {
      fs.unlink(img.replace("img", "uploads").substring(1), (err) =>
        err ? (error = true) : (error = false)
      );
      if (error) {
        return res
          .status(500)
          .json({ code: 500, message: "파일 삭제 오류입니다." });
      } else {
        return res
          .status(403)
          .json({ code: 403, message: "오늘 업로드 된 게시물이 존재합니다." });
      }
    }

    const tweet = await Tweet.create({
      content: content && content,
      img,
      weekend: user.weekend,
    });
    await user.addTweet(tweet.id);

    return res.json({ code: 200, message: "성공적으로 업로드" });
  } catch (e) {
    console.log(e);
    return next(e);
  }
});

router.get("/tweets/:lastId", isLoggedIn, async (req, res, next) => {
  try {
    const where = {};
    if (parseInt(req.params.lastId, 10)) {
      where.id = { [Op.lt]: parseInt(req.params.lastId, 10) };
    }

    const tweets = await Tweet.findAll({
      where,
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [{ model: User, attributes: ["id", "name", "img", "provider"] }],
    });
    res.json({ code: 200, meta: tweets });
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.get("/tweets/:lastId/:UserId", isLoggedIn, async (req, res, next) => {
  try {
    const where = {};
    if (parseInt(req.params.lastId, 10)) {
      where.id = { [Op.lt]: parseInt(req.params.lastId, 10) };
    }
    if (parseInt(req.params.UserId, 10)) {
      where.UserId = { [Op.eq]: parseInt(req.params.UserId, 10) };
    }

    const tweets = await Tweet.findAll({
      where,
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [{ model: User, attributes: ["id", "name", "img", "provider"] }],
    });
    res.json({ code: 200, meta: tweets });
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.delete("/tweet/delete/:id", isLoggedIn, async (req, res, next) => {
  const { id } = req.params;
  try {
    const tweet = await Tweet.findOne({
      where: { id },
      include: [{ model: User, attributes: ["id"] }],
    });
    var error = false;
    if (req.user.id == tweet.User.id) {
      await Tweet.destroy({ where: { id: tweet.id } });
      if (tweet.img.length != 0) {
        fs.unlink(tweet.img.replace("img", "uploads").substring(1), (err) =>
          err ? (error = true) : console.log("good")
        );
      }
      // res.status(404).send({ code: 404, message: err })

      if (!error) {
        return res.json({
          code: 200,
          message: "해당 트윗의 삭제가 완료되었습니다!",
        });
      } else {
        return res.status(404).send({ code: 404, message: err });
      }
    } else {
      return res
        .status(403)
        .json({ code: 403, message: "권한이 없습니다. 꺼지세요" });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
});

// router.post("/", isLoggedIn, upload.none(), async (req, res, next) => {

// });

module.exports = router;
