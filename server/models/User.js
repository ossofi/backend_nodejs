export default (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM("admin", "user"), allowNull: false, defaultValue: "user" }
  });

  User.associate = (models) => {
    User.hasMany(models.Article, {
      foreignKey: "createdBy",
    });
  };
  
  return User;
};
