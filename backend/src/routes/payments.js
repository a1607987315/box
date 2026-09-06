const router = require('express').Router();
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const { Payment, Customer, Supplier, SalesOrder, PurchaseOrder } = require('../models');
const { generateOrderNo, round2 } = require('../utils/helpers');

router.get('/', async (req, res) => {
  try {
    const { type, partnerType } = req.query;
    const where = {};
    if (type) where.type = type;
    if (partnerType) where.partnerType = partnerType;
    const list = await Payment.findAll({ where, order: [['id', 'DESC']], limit: 200 });
    const enriched = [];
    for (const p of list) {
      const obj = p.toJSON();
      if (p.partnerType === 'customer') {
        const c = await Customer.findByPk(p.partnerId);
        obj.partnerName = c ? c.name : '';
      } else {
        const s = await Supplier.findByPk(p.partnerId);
        obj.partnerName = s ? s.name : '';
      }
      enriched.push(obj);
    }
    res.json({ code: 0, data: enriched });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate + ' 23:59:59')] };
    }
    const receiveTotal = await Payment.sum('amount', { where: { ...where, type: 'receive' } }) || 0;
    const payTotal = await Payment.sum('amount', { where: { ...where, type: 'pay' } }) || 0;
    const receivable = await Customer.sum('receivableBalance') || 0;
    const payable = await Supplier.sum('payableBalance') || 0;
    res.json({ code: 0, data: { receiveTotal: round2(receiveTotal), payTotal: round2(payTotal), receivable: round2(receivable), payable: round2(payable) } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.post('/receive', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { customerId, amount, method, refId, remark } = req.body;
    const amt = Number(amount);
    const paymentNo = generateOrderNo('PAY');
    await Payment.create({
      paymentNo, type: 'receive', partnerId: customerId, partnerType: 'customer',
      amount: amt, method, refType: refId ? 'sales' : '', refId: refId || null, remark
    }, { transaction: t });
    const customer = await Customer.findByPk(customerId, { transaction: t });
    await customer.update({
      receivableBalance: round2(Number(customer.receivableBalance) - amt)
    }, { transaction: t });
    if (refId) {
      const order = await SalesOrder.findByPk(refId, { transaction: t });
      const received = round2(Number(order.receivedAmount) + amt);
      let status = 'unreceived';
      if (received >= Number(order.receivableAmount)) status = 'received';
      else if (received > 0) status = 'partial';
      await order.update({ receivedAmount: received, receiveStatus: status }, { transaction: t });
    }
    await t.commit();
    res.json({ code: 0, message: '收款成功' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.post('/pay', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { supplierId, amount, method, refId, remark } = req.body;
    const amt = Number(amount);
    const paymentNo = generateOrderNo('PAY');
    await Payment.create({
      paymentNo, type: 'pay', partnerId: supplierId, partnerType: 'supplier',
      amount: amt, method, refType: refId ? 'purchase' : '', refId: refId || null, remark
    }, { transaction: t });
    const supplier = await Supplier.findByPk(supplierId, { transaction: t });
    await supplier.update({
      payableBalance: round2(Number(supplier.payableBalance) - amt)
    }, { transaction: t });
    if (refId) {
      const order = await PurchaseOrder.findByPk(refId, { transaction: t });
      const paid = round2(Number(order.paidAmount) + amt);
      let status = 'unpaid';
      if (paid >= Number(order.totalAmount)) status = 'paid';
      else if (paid > 0) status = 'partial';
      await order.update({ paidAmount: paid, payStatus: status }, { transaction: t });
    }
    await t.commit();
    res.json({ code: 0, message: '付款成功' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
