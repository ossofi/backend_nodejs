'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Article extends Model {
    static associate(models) {
      // future associations
    }
  }

  Article.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Article',
    timestamps: true
  });

  return Article;
};
