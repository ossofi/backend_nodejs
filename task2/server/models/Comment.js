export default (sequelize, DataTypes) => {
    const Comment = sequelize.define("Comment", {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      articleId: { type: DataTypes.UUID, allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: false }
    });
  
    Comment.associate = (models) => {
      Comment.belongsTo(models.Article, {
        foreignKey: "articleId",
      });
    };    
  
    return Comment;
  };
  