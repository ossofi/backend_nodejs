'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('Articles', [
      {
        id: '22222222-2222-2222-2222-222222222222',
        title: 'Sample Article',
        content: 'This is a seeded article.',
        workspaceId: '11111111-1111-1111-1111-111111111111',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Articles', null, {});
  }
};
