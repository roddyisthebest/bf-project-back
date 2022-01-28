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
          type: Sequelize.STRING(500),
          allowNull: true,
        },
        weekend: {
          type: Sequelize.STRING(20),
          allowNull: false,
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
