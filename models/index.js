const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];

const Penalty = require("./penalty");
const Post = require("./post");
const Pray = require("./pray");
const Record = require("./record");
const Tweet = require("./tweet");
const User = require("./user");

const db = {};
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;
db.Penalty = Penalty;
db.Post = Post;
db.Pray = Pray;
db.Record = Record;
db.Tweet = Tweet;
db.User = User;

Penalty.init(sequelize);
Post.init(sequelize);
Pray.init(sequelize);
Record.init(sequelize);
Tweet.init(sequelize);
User.init(sequelize);

Penalty.associate(db);
Post.associate(db);
Pray.associate(db);
Record.associate(db);
Tweet.associate(db);
User.associate(db);

module.exports = db;
