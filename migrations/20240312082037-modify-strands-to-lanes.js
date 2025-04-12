"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn("Lines", "strands", "lanes");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn("Lines", "lanes", "strands");
  },
};
