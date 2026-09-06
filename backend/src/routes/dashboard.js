const router = require('express').Router();
const { Op } = require('sequelize');
const {
  SalesOrder, PurchaseOrder, Customer, Supplier, Product, Inventory
} = require('../models');
const { round2 } = require('../utils/helpers');

router.get('/', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySales = await SalesOrder.sum('receivableAmount', {
      where: { createdAt: { [Op.gte]: today, [Op.lt]: tomorrow }, status: { [Op.ne]: 'cancelled' } }
    }) || 0;

    const todayPurchases = await PurchaseOrder.sum('totalAmount', {
      where: { createdAt: { [Op.gte]: today, [Op.lt]: tomorrow }, status: { [Op.ne]: 'cancelled' } }
    }) || 0;

    const totalReceivable = await Customer.sum('receivableBalance') || 0;
    const totalPayable = await Supplier.sum('payableBalance') || 0;

    const inventories = await Inventory.findAll({ include: [Product] });
    const lowStockProducts = inventories.filter((row) => {
      const safety = Number(row.Product?.safetyStock || 0);
      return safety > 0 && Number(row.quantity) <= safety;
    }).slice(0, 20);

    res.json({
      code: 0,
      data: {
        todaySales: round2(todaySales),
        todayPurchases: round2(todayPurchases),
        totalReceivable: round2(totalReceivable),
        totalPayable: round2(totalPayable),
        lowStockCount: lowStockProducts.length,
        lowStockProducts
      }
    });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
