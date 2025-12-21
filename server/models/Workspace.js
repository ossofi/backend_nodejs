export default (sequelize, DataTypes) => {
  const Workspace = sequelize.define("Workspace", {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    name: { type: DataTypes.STRING, allowNull: false }
  });

  Workspace.associate = (models) => {
    Workspace.hasMany(models.Article, { foreignKey: "workspaceId" });
  };

  return Workspace;
};
