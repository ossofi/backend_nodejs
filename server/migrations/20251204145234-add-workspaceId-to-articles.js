'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Articles', 'workspaceId', {
      type: Sequelize.UUID,
      references: { model: 'Workspaces', key: 'id' },
      allowNull: true,
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Articles', 'workspaceId');
  }
};
