require("dotenv").config();

module.exports = {
  development: {
    username: "root",
    password: "bsy30228",
    database: "bf",
    host: "127.0.0.1",
    dialect: "mysql",
    timezone: "+09:00",
  },

  production: {
    host: "us-cdbr-east-05.cleardb.net",
    user: "b8dabc4d000c47",
    password: process.env.SEQUELIZE_PASSWORD,
    database: "heroku_7f8e72880db0558",
    dialect: "mysql",
    timezone: "+09:00",
  },
};
