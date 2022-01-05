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
        payed: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Penalty",
        tableName: "penaltys",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    console.log(db.Penalty);
    db.Penalty.belongsTo(db.User);
  }
};
