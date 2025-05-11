const { DataTypes } = require("sequelize");
const sequelize = require("../config/seq");

const Users = sequelize.define("Users", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password_hash: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  company_name: DataTypes.STRING,
  location: DataTypes.STRING,
  industry: DataTypes.STRING,
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  otp_code: {
    type: DataTypes.STRING(10),
    allowNull: true
  }
});

module.exports = Users;
