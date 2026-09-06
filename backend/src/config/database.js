const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'erp.db'),
  logging: false,
  define: {
    timestamps: true,
    underscored: false
  }
});

module.exports = sequelize;
