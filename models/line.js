"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Line extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Line.init(
    {
      name: DataTypes.STRING,
      lanes: DataTypes.STRING,
      blocks: DataTypes.STRING,
      status: DataTypes.STRING,
      stafflocation: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Line",
    }
  );
  return Line;
};
