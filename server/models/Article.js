export default (sequelize, DataTypes) => {
  const Article = sequelize.define("Article", {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    title: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT },
    workspaceId: { type: DataTypes.UUID, allowNull: true },
    createdBy: { type: DataTypes.UUID, allowNull: false }
  });

  Article.associate = (models) => {
    Article.hasMany(models.Comment, {
      as: "comments",
      foreignKey: "articleId",
      onDelete: "CASCADE",
    });

    Article.hasMany(models.ArticleVersion, {
      as: "Versions",
      foreignKey: "articleId",
      onDelete: "CASCADE"
    });
    
    Article.belongsTo(models.User, {
      foreignKey: "createdBy",
      as: "author",
    });
  };

  return Article;
};
