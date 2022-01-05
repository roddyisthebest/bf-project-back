const Sequelize = require("sequelize");

module.exports = class Tweet extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        content: {
          type: Sequelize.TEXT,
          allowNull: true,
          defaultValue: "none",
        },
        img: {
          type: Sequelize.STRING(200),
          allowNull: true,
        },
        weekend: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Tweet",
        tableName: "tweets",
        paranoid: false,
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }
  static associate(db) {
    db.Tweet.belongsTo(db.User);
  }
};
