const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  paymentNo: { type: DataTypes.STRING, unique: true, allowNull: false },
  type: { type: DataTypes.ENUM('receive', 'pay'), allowNull: false },
  partnerId: { type: DataTypes.INTEGER, allowNull: false },
  partnerType: { type: DataTypes.ENUM('customer', 'supplier'), allowNull: false },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  method: {
    type: DataTypes.ENUM('cash', 'bank_transfer', 'wechat', 'alipay', 'other'),
    defaultValue: 'cash'
  },
  refType: { type: DataTypes.STRING, defaultValue: '' },
  refId: { type: DataTypes.INTEGER, allowNull: true },
  remark: { type: DataTypes.TEXT, defaultValue: '' }
}, { tableName: 'payments' });

const PriceHistory = sequelize.define('PriceHistory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  customerId: { type: DataTypes.INTEGER, allowNull: false },
  unitPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  salesUnit: { type: DataTypes.STRING, defaultValue: '' },
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  orderNo: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'price_histories' });

module.exports = { Payment, PriceHistory };
