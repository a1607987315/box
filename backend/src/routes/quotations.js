const router = require('express').Router();
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const {
  Quotation, QuotationItem, Product, Customer, SalesOrder, SalesOrderItem
} = require('../models');
const { generateOrderNo, round2 } = require('../utils/helpers');

router.get('/', async (req, res) => {
  try {
    const { keyword, status } = req.query;
    const where = {};
    if (status) where.status = status;
    if (keyword) where.quoteNo = { [Op.like]: `%${keyword}%` };
    const list = await Quotation.findAll({
      where, include: [Customer], order: [['id', 'DESC']]
    });
    res.json({ code: 0, data: list });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const quote = await Quotation.findByPk(req.params.id, {
      include: [Customer, { model: QuotationItem, as: 'items', include: [Product] }]
    });
    if (!quote) return res.status(404).json({ code: 1, message: '不存在' });
    res.json({ code: 0, data: quote });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.get('/:id/print', async (req, res) => {
  try {
    const quote = await Quotation.findByPk(req.params.id, {
      include: [Customer, { model: QuotationItem, as: 'items', include: [Product] }]
    });
    if (!quote) return res.status(404).json({ code: 1, message: '不存在' });
    res.json({ code: 0, data: { type: 'quotation', quote, companyName: '供销存管理系统' } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.post('/', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { customerId, validUntil, items, discountRate, remark } = req.body;
    const quoteNo = generateOrderNo('QT');
    let totalAmount = 0;
    const quoteItems = [];
    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (!product) throw new Error(`商品不存在: ${item.productId}`);
      const ratio = Number(product.salesRatio) || 1;
      const baseQty = round2(Number(item.quantity) * ratio);
      const amount = round2(Number(item.quantity) * Number(item.unitPrice));
      totalAmount += amount;
      quoteItems.push({
        productId: item.productId,
        quantity: Number(item.quantity),
        baseQuantity: baseQty,
        unitPrice: Number(item.unitPrice),
        amount
      });
    }
    totalAmount = round2(totalAmount);
    const rate = Number(discountRate) || 0;
    const finalAmount = round2(totalAmount * (1 - rate / 100));
    const quote = await Quotation.create({
      quoteNo, customerId, validUntil, totalAmount,
      discountRate: rate, finalAmount, remark
    }, { transaction: t });
    for (const it of quoteItems) {
      await QuotationItem.create({ quotationId: quote.id, ...it }, { transaction: t });
    }
    await t.commit();
    res.json({ code: 0, data: { id: quote.id, quoteNo } });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const quote = await Quotation.findByPk(req.params.id, { transaction: t });
    if (!quote) throw new Error('报价单不存在');
    if (quote.status !== 'pending') throw new Error('当前状态不允许编辑');
    const { items, ...rest } = req.body;
    await quote.update(rest, { transaction: t });
    if (items) {
      await QuotationItem.destroy({ where: { quotationId: quote.id }, transaction: t });
      let totalAmount = 0;
      for (const item of items) {
        const product = await Product.findByPk(item.productId, { transaction: t });
        const ratio = Number(product.salesRatio) || 1;
        const baseQty = round2(Number(item.quantity) * ratio);
        const amount = round2(Number(item.quantity) * Number(item.unitPrice));
        totalAmount += amount;
        await QuotationItem.create({
          quotationId: quote.id, productId: item.productId,
          quantity: Number(item.quantity), baseQuantity: baseQty,
          unitPrice: Number(item.unitPrice), amount
        }, { transaction: t });
      }
      totalAmount = round2(totalAmount);
      const rate = Number(rest.discountRate || quote.discountRate) || 0;
      const finalAmount = round2(totalAmount * (1 - rate / 100));
      await quote.update({ totalAmount, finalAmount }, { transaction: t });
    }
    await t.commit();
    res.json({ code: 0, message: '更新成功' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.post('/:id/convert', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { warehouseId } = req.body;
    const quote = await Quotation.findByPk(req.params.id, {
      include: [{ model: QuotationItem, as: 'items' }], transaction: t
    });
    if (!quote) throw new Error('报价单不存在');
    if (quote.status === 'converted') throw new Error('该报价单已转订单');
    if (quote.status === 'expired') throw new Error('该报价单已过期');

    const orderNo = generateOrderNo('SO');
    const items = [];
    let totalAmount = 0;
    for (const qi of quote.items) {
      const product = await Product.findByPk(qi.productId, { transaction: t });
      const amount = Number(qi.amount);
      totalAmount += amount;
      items.push({
        productId: qi.productId, quantity: qi.quantity,
        baseQuantity: qi.baseQuantity, unitPrice: qi.unitPrice, amount
      });
    }
    totalAmount = round2(totalAmount);
    const discAmt = round2(totalAmount - Number(quote.finalAmount));
    const order = await SalesOrder.create({
      orderNo, customerId: quote.customerId, warehouseId,
      totalAmount, freight: 0, discountType: 'amount',
      discountValue: discAmt, discountAmount: discAmt,
      receivableAmount: quote.finalAmount, status: 'pending'
    }, { transaction: t });
    for (const it of items) {
      await SalesOrderItem.create({ orderId: order.id, ...it }, { transaction: t });
    }
    await quote.update({ status: 'converted', convertedOrderId: order.id }, { transaction: t });
    await t.commit();
    res.json({ code: 0, data: { id: order.id, orderNo } });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const quote = await Quotation.findByPk(req.params.id);
    if (!quote) return res.status(404).json({ code: 1, message: '不存在' });
    await quote.destroy();
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
