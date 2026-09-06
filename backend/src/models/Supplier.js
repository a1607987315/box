const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Supplier = sequelize.define('Supplier', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code: { type: DataTypes.STRING, unique: true, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  contact: { type: DataTypes.STRING, defaultValue: '' },
  phone: { type: DataTypes.STRING, defaultValue: '' },
  address: { type: DataTypes.STRING, defaultValue: '' },
  payableBalance: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  remark: { type: DataTypes.TEXT, defaultValue: '' }
}, { tableName: 'suppliers' });

module.exports = Supplier;
