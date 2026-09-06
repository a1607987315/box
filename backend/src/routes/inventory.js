const router = require('express').Router();
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const { Inventory, InventoryTransaction, Product, Warehouse } = require('../models');
const { round2 } = require('../utils/helpers');

router.get('/', async (req, res) => {
  try {
    const { warehouseId, keyword } = req.query;
    const where = {};
    if (warehouseId) where.warehouseId = warehouseId;
    const include = [Product, Warehouse];
    if (keyword) {
      include[0].where = {
        [Op.or]: [
          { name: { [Op.like]: `%${keyword}%` } },
          { code: { [Op.like]: `%${keyword}%` } }
        ]
      };
    }
    const list = await Inventory.findAll({ where, include, order: [['id', 'DESC']] });
    res.json({ code: 0, data: list });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.get('/transactions', async (req, res) => {
  try {
    const { productId, warehouseId, type, startDate, endDate } = req.query;
    const where = {};
    if (productId) where.productId = productId;
    if (warehouseId) where.warehouseId = warehouseId;
    if (type) where.type = type;
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate + ' 23:59:59')] };
    }
    const list = await InventoryTransaction.findAll({
      where, include: [Product, Warehouse], order: [['id', 'DESC']], limit: 500
    });
    res.json({ code: 0, data: list });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.post('/adjust', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { productId, warehouseId, quantity, remark } = req.body;
    const qty = Number(quantity);
    let inv = await Inventory.findOne({ where: { productId, warehouseId }, transaction: t });
    if (!inv) {
      inv = await Inventory.create({ productId, warehouseId, quantity: 0 }, { transaction: t });
    }
    const oldQty = Number(inv.quantity);
    inv.quantity = round2(oldQty + qty);
    await inv.save({ transaction: t });
    const type = qty > 0 ? 'adjust_in' : 'adjust_out';
    await InventoryTransaction.create({
      productId, warehouseId, type, quantity: qty,
      balanceAfter: inv.quantity, refType: 'adjust', refNo: '盘点调整', remark
    }, { transaction: t });
    await t.commit();
    res.json({ code: 0, message: '调整成功' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
