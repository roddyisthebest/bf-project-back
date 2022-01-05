const Sequelize = require("sequelize");

module.exports = class Pray extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        content: {
          type: Sequelize.STRING(140),
          allowNull: false,
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
        modelName: "Pray",
        tableName: "prays",
        paranoid: false,
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }
  static associate(db) {
    db.Pray.belongsTo(db.User);
  }
};
