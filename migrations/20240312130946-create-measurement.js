'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Measurements', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      staffid: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      stafflocation: {
        type: Sequelize.STRING
      },
      line: {
        type: Sequelize.STRING
      },
      value: {
        type: Sequelize.STRING
      },
      shift: {
        type: Sequelize.STRING
      },
      sku: {
        type: Sequelize.STRING
      },
      blocks: {
        type: Sequelize.STRING
      },
      measure_type: {
        type: Sequelize.STRING
      },
      transaction_id: {
        type: Sequelize.STRING
      },
      lanes: {
        type: Sequelize.STRING
      },
      lane: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Measurements');
  }
};