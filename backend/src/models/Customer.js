const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code: { type: DataTypes.STRING, unique: true, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  contact: { type: DataTypes.STRING, defaultValue: '' },
  phone: { type: DataTypes.STRING, defaultValue: '' },
  address: { type: DataTypes.STRING, defaultValue: '' },
  level: { type: DataTypes.ENUM('wholesale', 'retail'), defaultValue: 'retail' },
  receivableBalance: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  remark: { type: DataTypes.TEXT, defaultValue: '' }
}, { tableName: 'customers' });

module.exports = Customer;
