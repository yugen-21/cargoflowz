const DataTypes = require("sequelize");
const sequelize = require("../config/seq");
const Users = require("./users");

const Enquiry = sequelize.define(
  "Enquiry",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users", // table name
        key: "id",
      },
      onDelete: "CASCADE",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    origin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    destination: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "sent", "responded"),
      defaultValue: "pending",
    },
    pickup_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    cargo_type: {
      type: DataTypes.STRING,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "enquiries",
    timestamps: false,
  }
);

// Define association
Enquiry.belongsTo(Users, { foreignKey: "user_id" });
Users.hasMany(Enquiry, { foreignKey: "user_id" });

module.exports = Enquiry;
