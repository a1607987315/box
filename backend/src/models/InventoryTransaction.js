const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryTransaction = sequelize.define('InventoryTransaction', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  warehouseId: { type: DataTypes.INTEGER, allowNull: false },
  type: {
    type: DataTypes.ENUM('purchase_in', 'sales_out', 'transfer_out', 'transfer_in', 'adjust_in', 'adjust_out'),
    allowNull: false
  },
  quantity: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
  balanceAfter: { type: DataTypes.DECIMAL(12, 4), defaultValue: 0 },
  refType: { type: DataTypes.STRING, defaultValue: '' },
  refId: { type: DataTypes.INTEGER, defaultValue: null },
  refNo: { type: DataTypes.STRING, defaultValue: '' },
  remark: { type: DataTypes.TEXT, defaultValue: '' }
}, { tableName: 'inventory_transactions' });

module.exports = InventoryTransaction;
