const schedule = require("node-schedule");
const User = require("../models/user");
const Tweet = require("../models/tweet");
const Penalty = require("../models/penalty");
const Pray = require("../models/pray");
const { Op } = require("sequelize");
const Record = require("../models/record");
const moment = require("moment");
const fs = require("fs");

function getWeekNo() {
  var date = new Date();

  return Math.ceil(date.getDate() / 7);
}
const update = () =>
  schedule.scheduleJob("0 0 0 * * SUN", async function () {
    try {
      const users = await User.findAll({
        where: { admin: { [Op.not]: true } },
      });

      users.map(async (e) => {
        const tweetsInWeekend = await Tweet.findAll({
          where: { weekend: e.weekend, UserId: e.id },
        });

        var pay = 1000 * (6 - tweetsInWeekend.length);
        // 일주일 간 제출건수로 계산
        if (!(getWeekNo() == 1 && (moment().month() + 1) % 2 == 1)) {
          tweetsInWeekend.map((e) => {
            if (e.img.length == 0) {
              pay += 500;
            }
          });
        }

        // 글로만 냈다면 500원으로
        const penalty = await Penalty.findOne({ where: { UserId: e.id } });
        await Record.create({
          UserId: e.id,
          paper: pay,
          weekend: moment().day(0).format("YYYY-MM-DD"),
        });

        // 벌금 이월
        if (!penalty.payed) {
          pay += penalty.paper;
        }

        await Penalty.update(
          { paper: pay, payed: pay ? false : true },
          { where: { id: penalty.id } }
        );

        await Pray.create({
          UserId: e.id,
          weekend: moment().day(0).format("YYYY-MM-DD"),
          content: "default",
        });
      });
      await User.update(
        { weekend: moment().day(0).format("YYYY-MM-DD") },
        { where: { userId: { [Op.not]: "admin3927" } } }
      );

      //1주차, 3주차에 사진 파일 및 트윗 삭제
      if (getWeekNo() == 1 || getWeekNo() == 3) {
        const tweets = await Tweet.findAll();
        tweets.map((tweet) => {
          fs.unlink(tweet.img.replace("img", "uploads").substring(1), (err) =>
            err ? console.error(err) : console.log("사진이 성공적으로 삭제")
          );
        });

        await Tweet.destroy({ where: {}, truncate: true });
      }
    } catch (e) {
      console.log(e);
    }
  });

module.exports = update;
