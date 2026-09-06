const router = require('express').Router();
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const {
  PurchaseOrder, PurchaseOrderItem, Product, Supplier, Warehouse,
  Inventory, InventoryTransaction
} = require('../models');
const { generateOrderNo, round2 } = require('../utils/helpers');

router.get('/', async (req, res) => {
  try {
    const { keyword, status } = req.query;
    const where = {};
    if (status) where.status = status;
    if (keyword) where.orderNo = { [Op.like]: `%${keyword}%` };
    const list = await PurchaseOrder.findAll({
      where,
      include: [Supplier, Warehouse],
      order: [['id', 'DESC']]
    });
    res.json({ code: 0, data: list });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await PurchaseOrder.findByPk(req.params.id, {
      include: [Supplier, Warehouse, { model: PurchaseOrderItem, as: 'items', include: [Product] }]
    });
    if (!order) return res.status(404).json({ code: 1, message: '不存在' });
    res.json({ code: 0, data: order });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.post('/', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { supplierId, warehouseId, items, remark } = req.body;
    const orderNo = generateOrderNo('PO');
    let totalAmount = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (!product) throw new Error(`商品不存在: ${item.productId}`);
      const ratio = Number(product.purchaseRatio) || 1;
      const baseQty = round2(Number(item.quantity) * ratio);
      const amount = round2(Number(item.quantity) * Number(item.unitPrice));
      totalAmount += amount;
      orderItems.push({
        productId: item.productId,
        quantity: Number(item.quantity),
        baseQuantity: baseQty,
        unitPrice: Number(item.unitPrice),
        amount
      });
    }
    totalAmount = round2(totalAmount);
    const order = await PurchaseOrder.create({
      orderNo, supplierId, warehouseId, totalAmount, remark, status: 'pending'
    }, { transaction: t });
    for (const it of orderItems) {
      await PurchaseOrderItem.create({ orderId: order.id, ...it }, { transaction: t });
    }
    await t.commit();
    res.json({ code: 0, data: { id: order.id, orderNo } });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const order = await PurchaseOrder.findByPk(req.params.id, { transaction: t });
    if (!order) throw new Error('采购单不存在');
    if (order.status !== 'draft' && order.status !== 'pending') throw new Error('当前状态不允许编辑');
    const { items, ...rest } = req.body;
    await order.update(rest, { transaction: t });
    if (items) {
      await PurchaseOrderItem.destroy({ where: { orderId: order.id }, transaction: t });
      let totalAmount = 0;
      for (const item of items) {
        const product = await Product.findByPk(item.productId, { transaction: t });
        const ratio = Number(product.purchaseRatio) || 1;
        const baseQty = round2(Number(item.quantity) * ratio);
        const amount = round2(Number(item.quantity) * Number(item.unitPrice));
        totalAmount += amount;
        await PurchaseOrderItem.create({
          orderId: order.id,
          productId: item.productId,
          quantity: Number(item.quantity),
          baseQuantity: baseQty,
          unitPrice: Number(item.unitPrice),
          amount
        }, { transaction: t });
      }
      await order.update({ totalAmount: round2(totalAmount) }, { transaction: t });
    }
    await t.commit();
    res.json({ code: 0, message: '更新成功' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.post('/:id/receive', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const order = await PurchaseOrder.findByPk(req.params.id, {
      include: [{ model: PurchaseOrderItem, as: 'items' }],
      transaction: t
    });
    if (!order) throw new Error('采购单不存在');
    if (order.status === 'received') throw new Error('该采购单已入库');
    if (order.status === 'cancelled') throw new Error('该采购单已取消');

    for (const item of order.items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      const baseQty = Number(item.baseQuantity);
      let inv = await Inventory.findOne({
        where: { productId: item.productId, warehouseId: order.warehouseId },
        transaction: t
      });
      let oldQty = 0;
      let oldCost = Number(product.costPrice) || 0;
      if (!inv) {
        inv = await Inventory.create({
          productId: item.productId, warehouseId: order.warehouseId, quantity: 0
        }, { transaction: t });
      } else {
        oldQty = Number(inv.quantity);
      }
      const purchaseUnitPrice = Number(item.unitPrice) / (Number(product.purchaseRatio) || 1);
      let newCost = oldCost;
      if (oldQty + baseQty > 0) {
        newCost = (oldQty * oldCost + baseQty * purchaseUnitPrice) / (oldQty + baseQty);
      }
      inv.quantity = round2(oldQty + baseQty);
      await inv.save({ transaction: t });
      await product.update({ costPrice: round2(newCost) }, { transaction: t });
      await InventoryTransaction.create({
        productId: item.productId,
        warehouseId: order.warehouseId,
        type: 'purchase_in',
        quantity: baseQty,
        balanceAfter: inv.quantity,
        refType: 'purchase',
        refId: order.id,
        refNo: order.orderNo
      }, { transaction: t });
    }

    const supplier = await Supplier.findByPk(order.supplierId, { transaction: t });
    await supplier.update({
      payableBalance: round2(Number(supplier.payableBalance) + Number(order.totalAmount))
    }, { transaction: t });

    await order.update({ status: 'received', receivedAt: new Date() }, { transaction: t });

    await t.commit();
    res.json({ code: 0, message: '入库成功' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const order = await PurchaseOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ code: 1, message: '不存在' });
    if (order.status === 'received') return res.status(400).json({ code: 1, message: '已入库单据不能删除' });
    await order.update({ status: 'cancelled' });
    res.json({ code: 0, message: '已取消' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
