const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const dotenv = require("dotenv");
const passport = require("passport");
const cors = require("cors");
const update = require("./utils/penalty");
const app = express();

const webSocket = require("./socket");
dotenv.config();

const { sequelize } = require("./models");

sequelize
  .sync({ force: false })
  .then(() => console.log("데이터 베이스 연결 성공했다리요!"))
  .catch((err) => {
    console.log(err);
  });
const passportConfig = require("./passport");
passportConfig();

const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");
const penaltyRoutes = require("./routes/penalty");
const prayRoutes = require("./routes/pray");

app.use(morgan("dev"));
app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);
app.set("port", process.env.PORT || 8001);
app.use(express.static(path.join(__dirname, "public")));
app.use("/img", express.static(path.join(__dirname, "uploads")));

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
app.use(passport.initialize());
app.use(passport.session());

update();
app.use("/user", userRoutes);
app.use("/post", postRoutes);
app.use("/penalty", penaltyRoutes);
app.use("/pray", prayRoutes);

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  res.status(err.status || 500);
  res.json({ code: err.status, err });
});

const server = app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기중");
});

webSocket(server);
