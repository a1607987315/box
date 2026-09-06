const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SalesOrder = sequelize.define('SalesOrder', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderNo: { type: DataTypes.STRING, unique: true, allowNull: false },
  customerId: { type: DataTypes.INTEGER, allowNull: false },
  warehouseId: { type: DataTypes.INTEGER, allowNull: false },
  totalAmount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  freight: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  discountType: {
    type: DataTypes.ENUM('rate', 'amount', 'none'),
    defaultValue: 'none'
  },
  discountValue: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  discountAmount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  receivableAmount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  receivedAmount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  status: {
    type: DataTypes.ENUM('draft', 'pending', 'shipped', 'cancelled'),
    defaultValue: 'draft'
  },
  receiveStatus: {
    type: DataTypes.ENUM('unreceived', 'partial', 'received'),
    defaultValue: 'unreceived'
  },
  remark: { type: DataTypes.TEXT, defaultValue: '' },
  shippedAt: { type: DataTypes.DATE, allowNull: true }
}, { tableName: 'sales_orders' });

const SalesOrderItem = sequelize.define('SalesOrderItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
  baseQuantity: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
  unitPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false }
}, { tableName: 'sales_order_items' });

SalesOrder.hasMany(SalesOrderItem, { foreignKey: 'orderId', as: 'items' });
SalesOrderItem.belongsTo(SalesOrder, { foreignKey: 'orderId' });

module.exports = { SalesOrder, SalesOrderItem };
