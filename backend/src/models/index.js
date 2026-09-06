const sequelize = require('../config/database');
const Product = require('./Product');
const Supplier = require('./Supplier');
const Customer = require('./Customer');
const Warehouse = require('./Warehouse');
const Inventory = require('./Inventory');
const InventoryTransaction = require('./InventoryTransaction');
const { PurchaseOrder, PurchaseOrderItem } = require('./PurchaseOrder');
const { SalesOrder, SalesOrderItem } = require('./SalesOrder');
const { Quotation, QuotationItem } = require('./Quotation');
const { Payment, PriceHistory } = require('./Payment');

Product.belongsToMany(Warehouse, { through: Inventory, foreignKey: 'productId', otherKey: 'warehouseId' });
Warehouse.belongsToMany(Product, { through: Inventory, foreignKey: 'warehouseId', otherKey: 'productId' });
Product.hasMany(Inventory, { foreignKey: 'productId' });
Inventory.belongsTo(Product, { foreignKey: 'productId' });
Warehouse.hasMany(Inventory, { foreignKey: 'warehouseId' });
Inventory.belongsTo(Warehouse, { foreignKey: 'warehouseId' });

Product.hasMany(InventoryTransaction, { foreignKey: 'productId' });
InventoryTransaction.belongsTo(Product, { foreignKey: 'productId' });
Warehouse.hasMany(InventoryTransaction, { foreignKey: 'warehouseId' });
InventoryTransaction.belongsTo(Warehouse, { foreignKey: 'warehouseId' });

Supplier.hasMany(PurchaseOrder, { foreignKey: 'supplierId' });
PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplierId' });
Warehouse.hasMany(PurchaseOrder, { foreignKey: 'warehouseId' });
PurchaseOrder.belongsTo(Warehouse, { foreignKey: 'warehouseId' });
Product.hasMany(PurchaseOrderItem, { foreignKey: 'productId' });
PurchaseOrderItem.belongsTo(Product, { foreignKey: 'productId' });

Customer.hasMany(SalesOrder, { foreignKey: 'customerId' });
SalesOrder.belongsTo(Customer, { foreignKey: 'customerId' });
Warehouse.hasMany(SalesOrder, { foreignKey: 'warehouseId' });
SalesOrder.belongsTo(Warehouse, { foreignKey: 'warehouseId' });
Product.hasMany(SalesOrderItem, { foreignKey: 'productId' });
SalesOrderItem.belongsTo(Product, { foreignKey: 'productId' });

Customer.hasMany(Quotation, { foreignKey: 'customerId' });
Quotation.belongsTo(Customer, { foreignKey: 'customerId' });
Product.hasMany(QuotationItem, { foreignKey: 'productId' });
QuotationItem.belongsTo(Product, { foreignKey: 'productId' });

Product.hasMany(PriceHistory, { foreignKey: 'productId' });
PriceHistory.belongsTo(Product, { foreignKey: 'productId' });
Customer.hasMany(PriceHistory, { foreignKey: 'customerId' });
PriceHistory.belongsTo(Customer, { foreignKey: 'customerId' });

module.exports = {
  sequelize,
  Product,
  Supplier,
  Customer,
  Warehouse,
  Inventory,
  InventoryTransaction,
  PurchaseOrder,
  PurchaseOrderItem,
  SalesOrder,
  SalesOrderItem,
  Quotation,
  QuotationItem,
  Payment,
  PriceHistory
};
