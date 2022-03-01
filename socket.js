const SocketIO = require("socket.io");
const dotenv = require("dotenv");
dotenv.config();
module.exports = (server) => {
  const io = SocketIO(server, {
    cors: true,
    origins: [process.env.FRONT_URL],
  });

  io.on("connection", (socket) => {
    const req = socket.request;
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("새로운 클라이언트 접속", ip, socket.id, req.ip);

    socket.on("disconnect", () => {
      console.log("클라이언트 접속 해제", ip, socket.id);
    });
    socket.on("error", (error) => {
      console.error(error);
    });
    socket.on("feed-upload", (data) => {
      console.log(data);
      io.emit("feed-upload", data.id);
    });

    // ws.interval = setInterval(() => {
    //   if (ws.readyState == ws.OPEN) {
    //     ws.send("서버에서 클라이언트 메세지를 보냅니다.");
    //   }
    // }, 3000);
  });
};
