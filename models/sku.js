"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Sku extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Sku.init(
    {
      name: DataTypes.STRING,
      target: DataTypes.STRING,
      spread: DataTypes.STRING,
      lsl: DataTypes.STRING,
      usl: DataTypes.STRING,
      plsl: DataTypes.STRING,
      pusl: DataTypes.STRING,

      cusl: DataTypes.STRING,
      clsl: DataTypes.STRING,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Sku",
    }
  );
  return Sku;
};
