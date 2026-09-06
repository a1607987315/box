const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quotation = sequelize.define('Quotation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quoteNo: { type: DataTypes.STRING, unique: true, allowNull: false },
  customerId: { type: DataTypes.INTEGER, allowNull: false },
  validUntil: { type: DataTypes.DATEONLY, allowNull: true },
  totalAmount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  discountRate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  finalAmount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'expired', 'converted'),
    defaultValue: 'pending'
  },
  convertedOrderId: { type: DataTypes.INTEGER, allowNull: true },
  remark: { type: DataTypes.TEXT, defaultValue: '' }
}, { tableName: 'quotations' });

const QuotationItem = sequelize.define('QuotationItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quotationId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
  baseQuantity: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
  unitPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false }
}, { tableName: 'quotation_items' });

Quotation.hasMany(QuotationItem, { foreignKey: 'quotationId', as: 'items' });
QuotationItem.belongsTo(Quotation, { foreignKey: 'quotationId' });

module.exports = { Quotation, QuotationItem };
