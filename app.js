const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const dotenv = require("dotenv");
const passport = require("passport");
const cors = require("cors");

const app = express();

dotenv.config();

const { sequelize } = require("./models");

sequelize
  .sync({ force: false })
  .then(() => console.log("데이터 베이스 연결 성공했다리요!"))
  .catch((err) => {
    console.log(err);
  });

app.use(morgan("dev"));
app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);
app.set("port", process.env.PORT || 8001);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기중");
});
