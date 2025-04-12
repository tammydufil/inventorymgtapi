"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Measurements", "time", {
      type: Sequelize.STRING,
      allowNull: true, // or false depending on your requirements
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Measurements", "time");
  },
};
