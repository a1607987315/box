const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderNo: { type: DataTypes.STRING, unique: true, allowNull: false },
  supplierId: { type: DataTypes.INTEGER, allowNull: false },
  warehouseId: { type: DataTypes.INTEGER, allowNull: false },
  totalAmount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  paidAmount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  status: {
    type: DataTypes.ENUM('draft', 'pending', 'received', 'cancelled'),
    defaultValue: 'draft'
  },
  payStatus: {
    type: DataTypes.ENUM('unpaid', 'partial', 'paid'),
    defaultValue: 'unpaid'
  },
  remark: { type: DataTypes.TEXT, defaultValue: '' },
  receivedAt: { type: DataTypes.DATE, allowNull: true }
}, { tableName: 'purchase_orders' });

const PurchaseOrderItem = sequelize.define('PurchaseOrderItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
  baseQuantity: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
  unitPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false }
}, { tableName: 'purchase_order_items' });

PurchaseOrder.hasMany(PurchaseOrderItem, { foreignKey: 'orderId', as: 'items' });
PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: 'orderId' });

module.exports = { PurchaseOrder, PurchaseOrderItem };
