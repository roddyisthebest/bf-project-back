const express = require("express");
const db = require("../models");
const { Op } = require("sequelize");
const { isLoggedIn } = require("./middlewares");
const moment = require("moment");

const router = express.Router();

router.get("/", isLoggedIn, async (req, res, next) => {
  try {
    const prayList = await db.User.findAll({
      where: { admin: { [Op.not]: true } },
      attributes: ["id", "img", "name", "weekend", "admin"],
      include: [
        {
          model: db.Pray,
          where: { weekend: { [Op.eq]: moment().day(0).format("YYYY-MM-DD") } },
          order: [["createdAt", "DESC"]],
        },
      ],
    });
    res.json({ code: 200, meta: prayList });
  } catch (e) {
    console.log(e);
    next(e);
  }
});

router.get("/:UserId/:lastId", isLoggedIn, async (req, res, next) => {
  const { UserId, lastId } = req.params;

  try {
    const where = { UserId, content: { [Op.not]: "default" } };
    if (parseInt(lastId, 10)) {
      where.id = { [Op.lt]: parseInt(lastId, 10) };
    }
    const prays = await db.Pray.findAll({
      where,
      order: [["createdAt", "DESC"]],

      limit: 5,
    });

    return res.json({ code: 200, meta: prays });
  } catch (e) {
    console.log(e);
    next(e);
  }
});

router.post("/", isLoggedIn, async (req, res, next) => {
  const { UserId, content } = req.body;
  try {
    const pray = await db.Pray.create({
      UserId,
      weekend: moment().day(0).format("YYYY-MM-DD"),
      content,
    });
    return res.json({
      code: 200,
      message:
        "형제자매님의 기도제목이 성공적으로 db에 저장되었으니 기도해주세요.",
      meta: pray.id,
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
});

router.put("/", isLoggedIn, async (req, res, next) => {
  const { id, content } = req.body;
  try {
    await db.Pray.update({ content }, { where: { id } });
    return res.send({
      code: 200,
      message: "유저의 기도제목이 성공적으로 변경되었습니다.",
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
});

router.delete("/:id", isLoggedIn, async (req, res, next) => {
  const { id } = req.params;
  try {
    await db.Pray.destroy({ where: { id } });
    return res.json({
      code: 200,
      message: "해당 기도제목의 삭제가 완료되었습니다!",
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
});

module.exports = router;
