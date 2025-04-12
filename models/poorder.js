'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Poorder extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Poorder.init({
    date: DataTypes.STRING,
    poorder: DataTypes.STRING,
    sku: DataTypes.STRING,
    line: DataTypes.STRING,
    shift: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Poorder',
  });
  return Poorder;
};