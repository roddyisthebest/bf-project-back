const Sequelize = require("sequelize");

module.exports = class Penalty extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        paper: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        weekend: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Record",
        tableName: "records",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.Record.belongsTo(db.User);
  }
};
