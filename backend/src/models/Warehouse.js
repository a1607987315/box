const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Warehouse = sequelize.define('Warehouse', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code: { type: DataTypes.STRING, unique: true, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, defaultValue: '' },
  remark: { type: DataTypes.TEXT, defaultValue: '' }
}, { tableName: 'warehouses' });

module.exports = Warehouse;
