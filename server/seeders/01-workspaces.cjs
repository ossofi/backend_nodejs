'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('Workspaces', [
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Default Workspace',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Workspaces', null, {});
  }
};
