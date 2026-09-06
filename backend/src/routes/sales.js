const router = require('express').Router();
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const {
  SalesOrder, SalesOrderItem, Product, Customer, Warehouse,
  Inventory, InventoryTransaction, PriceHistory, Quotation
} = require('../models');
const { generateOrderNo, round2, calcDiscountAmount } = require('../utils/helpers');

router.get('/', async (req, res) => {
  try {
    const { keyword, status } = req.query;
    const where = {};
    if (status) where.status = status;
    if (keyword) where.orderNo = { [Op.like]: `%${keyword}%` };
    const list = await SalesOrder.findAll({
      where, include: [Customer, Warehouse], order: [['id', 'DESC']]
    });
    res.json({ code: 0, data: list });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.get('/price-history', async (req, res) => {
  try {
    const { productId, customerId } = req.query;
    const list = await PriceHistory.findAll({
      where: { productId, customerId },
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    res.json({ code: 0, data: list });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await SalesOrder.findByPk(req.params.id, {
      include: [Customer, Warehouse, { model: SalesOrderItem, as: 'items', include: [Product] }]
    });
    if (!order) return res.status(404).json({ code: 1, message: '不存在' });
    res.json({ code: 0, data: order });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.get('/:id/print', async (req, res) => {
  try {
    const order = await SalesOrder.findByPk(req.params.id, {
      include: [Customer, Warehouse, { model: SalesOrderItem, as: 'items', include: [Product] }]
    });
    if (!order) return res.status(404).json({ code: 1, message: '不存在' });
    res.json({ code: 0, data: { type: 'sales', order, companyName: '供销存管理系统' } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.post('/', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { customerId, warehouseId, items, freight, discountType, discountValue, remark } = req.body;
    const orderNo = generateOrderNo('SO');
    let totalAmount = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (!product) throw new Error(`商品不存在: ${item.productId}`);
      const ratio = Number(product.salesRatio) || 1;
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
    const freightAmt = round2(freight || 0);
    const discAmt = calcDiscountAmount(totalAmount, discountType || 'none', discountValue || 0);
    const receivableAmount = round2(totalAmount + freightAmt - discAmt);
    const order = await SalesOrder.create({
      orderNo, customerId, warehouseId,
      totalAmount, freight: freightAmt,
      discountType: discountType || 'none',
      discountValue: Number(discountValue) || 0,
      discountAmount: discAmt,
      receivableAmount, remark, status: 'pending'
    }, { transaction: t });
    for (const it of orderItems) {
      await SalesOrderItem.create({ orderId: order.id, ...it }, { transaction: t });
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
    const order = await SalesOrder.findByPk(req.params.id, { transaction: t });
    if (!order) throw new Error('销售订单不存在');
    if (order.status !== 'draft' && order.status !== 'pending') throw new Error('当前状态不允许编辑');
    const { items, ...rest } = req.body;
    await order.update(rest, { transaction: t });
    if (items) {
      await SalesOrderItem.destroy({ where: { orderId: order.id }, transaction: t });
      let totalAmount = 0;
      for (const item of items) {
        const product = await Product.findByPk(item.productId, { transaction: t });
        const ratio = Number(product.salesRatio) || 1;
        const baseQty = round2(Number(item.quantity) * ratio);
        const amount = round2(Number(item.quantity) * Number(item.unitPrice));
        totalAmount += amount;
        await SalesOrderItem.create({
          orderId: order.id, productId: item.productId,
          quantity: Number(item.quantity), baseQuantity: baseQty,
          unitPrice: Number(item.unitPrice), amount
        }, { transaction: t });
      }
      totalAmount = round2(totalAmount);
      const freightAmt = round2(rest.freight || order.freight || 0);
      const discType = rest.discountType || order.discountType || 'none';
      const discVal = rest.discountValue != null ? rest.discountValue : order.discountValue;
      const discAmt = calcDiscountAmount(totalAmount, discType, discVal);
      const receivableAmount = round2(totalAmount + freightAmt - discAmt);
      await order.update({ totalAmount, freight: freightAmt, discountAmount: discAmt, receivableAmount }, { transaction: t });
    }
    await t.commit();
    res.json({ code: 0, message: '更新成功' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.post('/:id/ship', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const order = await SalesOrder.findByPk(req.params.id, {
      include: [{ model: SalesOrderItem, as: 'items' }], transaction: t
    });
    if (!order) throw new Error('销售订单不存在');
    if (order.status === 'shipped') throw new Error('该订单已出库');
    if (order.status === 'cancelled') throw new Error('该订单已取消');

    for (const item of order.items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      const baseQty = Number(item.baseQuantity);
      let inv = await Inventory.findOne({
        where: { productId: item.productId, warehouseId: order.warehouseId },
        transaction: t
      });
      if (!inv || Number(inv.quantity) < baseQty) {
        throw new Error(`商品[${product.name}]库存不足，当前库存${inv ? inv.quantity : 0}${product.baseUnit}，需出库${baseQty}${product.baseUnit}`);
      }
      inv.quantity = round2(Number(inv.quantity) - baseQty);
      await inv.save({ transaction: t });
      await InventoryTransaction.create({
        productId: item.productId, warehouseId: order.warehouseId,
        type: 'sales_out', quantity: -baseQty, balanceAfter: inv.quantity,
        refType: 'sales', refId: order.id, refNo: order.orderNo
      }, { transaction: t });
      await PriceHistory.create({
        productId: item.productId, customerId: order.customerId,
        unitPrice: item.unitPrice, salesUnit: product.salesUnit || product.baseUnit,
        orderId: order.id, orderNo: order.orderNo
      }, { transaction: t });
    }

    const customer = await Customer.findByPk(order.customerId, { transaction: t });
    await customer.update({
      receivableBalance: round2(Number(customer.receivableBalance) + Number(order.receivableAmount))
    }, { transaction: t });

    await order.update({ status: 'shipped', shippedAt: new Date() }, { transaction: t });
    await t.commit();
    res.json({ code: 0, message: '出库成功' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const order = await SalesOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ code: 1, message: '不存在' });
    if (order.status === 'shipped') return res.status(400).json({ code: 1, message: '已出库单据不能删除' });
    await order.update({ status: 'cancelled' });
    res.json({ code: 0, message: '已取消' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
