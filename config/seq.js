const { Sequelize } = require("sequelize");

// Initialize Sequelize with your PostgreSQL connection string
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,        // Set to true to see SQL queries
  ssl: false,            // Optional, use true + options for Railway or other hosted DBs
  dialectOptions: {
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
  }
});

module.exports = sequelize;
