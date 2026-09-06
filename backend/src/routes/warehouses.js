const router = require('express').Router();
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const { Warehouse, Inventory, InventoryTransaction, Product } = require('../models');

router.get('/', async (req, res) => {
  try {
    const list = await Warehouse.findAll({ order: [['id', 'ASC']] });
    res.json({ code: 0, data: list });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const warehouse = await Warehouse.findByPk(req.params.id, {
      include: [{ model: Inventory, include: [Product] }]
    });
    if (!warehouse) return res.status(404).json({ code: 1, message: '不存在' });
    res.json({ code: 0, data: warehouse });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await Warehouse.create(req.body);
    res.json({ code: 0, data: item });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await Warehouse.findByPk(req.params.id);
    if (!item) return res.status(404).json({ code: 1, message: '不存在' });
    await item.update(req.body);
    res.json({ code: 0, data: item });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await Warehouse.findByPk(req.params.id);
    if (!item) return res.status(404).json({ code: 1, message: '不存在' });
    await item.destroy();
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.post('/transfer', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { fromWarehouseId, toWarehouseId, productId, quantity, remark } = req.body;
    const qty = Number(quantity);
    if (fromWarehouseId === toWarehouseId) throw new Error('调出和调入仓库不能相同');
    const fromInv = await Inventory.findOne({ where: { productId, warehouseId: fromWarehouseId }, transaction: t });
    if (!fromInv || Number(fromInv.quantity) < qty) throw new Error('调出仓库库存不足');
    let toInv = await Inventory.findOne({ where: { productId, warehouseId: toWarehouseId }, transaction: t });
    if (!toInv) {
      toInv = await Inventory.create({ productId, warehouseId: toWarehouseId, quantity: 0 }, { transaction: t });
    }
    fromInv.quantity = Number(fromInv.quantity) - qty;
    toInv.quantity = Number(toInv.quantity) + qty;
    await fromInv.save({ transaction: t });
    await toInv.save({ transaction: t });
    await InventoryTransaction.bulkCreate([
      { productId, warehouseId: fromWarehouseId, type: 'transfer_out', quantity: -qty, balanceAfter: fromInv.quantity, refType: 'transfer', refNo: '调拨', remark },
      { productId, warehouseId: toWarehouseId, type: 'transfer_in', quantity: qty, balanceAfter: toInv.quantity, refType: 'transfer', refNo: '调拨', remark }
    ], { transaction: t });
    await t.commit();
    res.json({ code: 0, message: '调拨成功' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
