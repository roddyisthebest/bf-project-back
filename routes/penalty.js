const express = require("express");
const { Op } = require("sequelize");
const db = require("../models");
const { isLoggedIn, isAdmin } = require("./middlewares");

const router = express.Router();

router.get("/", isLoggedIn, async (req, res, next) => {
  try {
    const penaltys = await db.Penalty.findAll({
      include: { model: db.User, attributes: ["id", "img", "name", "weekend"] },
    });

    res.json({ code: 200, meta: penaltys });
  } catch (e) {
    console.log(e);
    next(e);
  }
});

router.post("/check", isLoggedIn, isAdmin, async (req, res) => {
  const { id, payed } = req.body;
  try {
    await db.Penalty.update({ payed }, { where: { id } });
    return res.send({
      code: 200,
      message: "유저의 벌금 제출 설정란이 성공적으로 변경되었습니다.",
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
});

module.exports = router;
