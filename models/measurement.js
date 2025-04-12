"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Measurement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Measurement.init(
    {
      staffid: DataTypes.STRING,
      name: DataTypes.STRING,
      stafflocation: DataTypes.STRING,
      line: DataTypes.STRING,
      value: DataTypes.STRING,
      shift: DataTypes.STRING,
      poorder: DataTypes.STRING,
      sku: DataTypes.STRING,
      blocks: DataTypes.STRING,
      measure_type: DataTypes.STRING,
      transaction_id: DataTypes.STRING,
      lanes: DataTypes.STRING,
      lane: DataTypes.STRING,
      time: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Measurement",
    }
  );
  return Measurement;
};
