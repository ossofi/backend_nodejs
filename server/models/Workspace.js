export default (sequelize, DataTypes) => {
  const Workspace = sequelize.define("Workspace", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false }
  });

  Workspace.associate = (models) => {
    Workspace.hasMany(models.Article, { foreignKey: "workspaceId" });
  };

  return Workspace;
};
