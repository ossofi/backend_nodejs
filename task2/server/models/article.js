export default (sequelize, DataTypes) => {
  const Article = sequelize.define("Article", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    title: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT },
    workspaceId: { type: DataTypes.INTEGER, allowNull: true }
  });

  Article.associate = (models) => {
    Article.hasMany(models.Comment, {
      as: "Comments",
      foreignKey: "articleId",
      onDelete: "CASCADE",
    });
  };  

  return Article;
};
