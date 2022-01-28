const schedule = require("node-schedule");
const User = require("../models/user");
const Tweet = require("../models/tweet");
const Penalty = require("../models/penalty");
const Pray = require("../models/pray");
const { sequelize } = require("../models");
const { Op } = require("sequelize");

const moment = require("moment");

Date.prototype.getWeek = function (dowOffset) {
  /*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com */

  dowOffset = typeof dowOffset == "number" ? dowOffset : 0; // dowOffset이 숫자면 넣고 아니면 0
  var newYear = new Date(this.getFullYear(), 0, 1);
  var day = newYear.getDay() - dowOffset; //the day of week the year begins on
  day = day >= 0 ? day : day + 7;
  var daynum =
    Math.floor(
      (this.getTime() -
        newYear.getTime() -
        (this.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) /
        86400000
    ) + 1;
  var weeknum;
  //if the year starts before the middle of a week
  if (day < 4) {
    weeknum = Math.floor((daynum + day - 1) / 7) + 1;
    if (weeknum > 52) {
      let nYear = new Date(this.getFullYear() + 1, 0, 1);
      let nday = nYear.getDay() - dowOffset;
      nday = nday >= 0 ? nday : nday + 7;
      /*if the next year starts before the middle of
      the week, it is week #1 of that year*/
      weeknum = nday < 4 ? 1 : 53;
    }
  } else {
    weeknum = Math.floor((daynum + day - 1) / 7);
  }
  return weeknum;
};
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
        if (!(new Date().getWeek() == 1 && (moment().month() + 1) % 2 == 1)) {
          tweetsInWeekend.map((e) => {
            if (e.img.length == 0) {
              pay += 500;
            }
          });
        }

        // 글로만 냈다면 500원으로
        const penalty = await Penalty.findOne({ where: { UserId: e.id } });
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

      // const [result, metadata] = await sequelize.query(
      //   `update users set weekend=${moment().day(0).format("YYYY-MM-DD")};`
      // );
    } catch (e) {
      console.log(e);
    }
  });

module.exports = update;
