const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inventory = sequelize.define('Inventory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  warehouseId: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.DECIMAL(12, 4), defaultValue: 0 }
}, {
  tableName: 'inventory',
  indexes: [{ unique: true, fields: ['productId', 'warehouseId'] }]
});

module.exports = Inventory;
