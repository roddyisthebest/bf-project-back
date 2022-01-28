const Sequelize = require("sequelize");

module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        userId: {
          type: Sequelize.STRING(30),
          allowNull: true,
          unique: false,
        },
        name: {
          type: Sequelize.STRING(15),
          allowNull: false,
          unique: false,
        },
        password: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        provider: {
          type: Sequelize.STRING(20),
          allowNull: false,
          defaultValue: "local",
        },
        snsId: {
          type: Sequelize.STRING(30),
          allowNull: true,
        },
        img: {
          type: Sequelize.STRING(300),
          allowNull: true,
          defaultValue: "none",
        },
        weekend: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        admin: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "User",
        tableName: "users",
        paranoid: true,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.User.hasMany(db.Tweet);
    db.User.hasMany(db.Pray);
    db.User.hasMany(db.Post);
    db.User.hasOne(db.Penalty);
    db.User.belongsToMany(db.User, {
      foreignKey: "followingId",
      as: "Followers",
      through: "Follow",
    });

    db.User.belongsToMany(db.User, {
      foreignKey: "followerId",
      as: "Followings",
      through: "Follow",
    });

    db.User.hasMany(db.Record);
  }
};
