export default (sequelize, DataTypes) => {
    const ArticleVersion = sequelize.define("ArticleVersion", {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      articleId: { type: DataTypes.UUID, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: false },
      versionNumber: { type: DataTypes.INTEGER, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    }, { updatedAt: false });
  
    ArticleVersion.associate = (models) => {
      ArticleVersion.belongsTo(models.Article, { foreignKey: "articleId" });
    };
  
    return ArticleVersion;
  };