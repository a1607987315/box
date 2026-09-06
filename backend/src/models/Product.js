const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code: { type: DataTypes.STRING, unique: true, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, defaultValue: '' },
  spec: { type: DataTypes.STRING, defaultValue: '' },
  baseUnit: { type: DataTypes.STRING, allowNull: false },
  purchaseUnit: { type: DataTypes.STRING, defaultValue: '' },
  purchaseRatio: { type: DataTypes.DECIMAL(12, 4), defaultValue: 1 },
  salesUnit: { type: DataTypes.STRING, defaultValue: '' },
  salesRatio: { type: DataTypes.DECIMAL(12, 4), defaultValue: 1 },
  costPrice: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  wholesalePrice: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  salesPrice: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  safetyStock: { type: DataTypes.DECIMAL(12, 4), defaultValue: 0 },
  remark: { type: DataTypes.TEXT, defaultValue: '' }
}, { tableName: 'products' });

module.exports = Product;
