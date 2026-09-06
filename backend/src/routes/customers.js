const router = require('express').Router();
const { Op } = require('sequelize');
const { Customer, SalesOrder, Quotation, Payment, PriceHistory } = require('../models');

router.get('/', async (req, res) => {
  try {
    const { keyword } = req.query;
    const where = {};
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { code: { [Op.like]: `%${keyword}%` } }
      ];
    }
    const list = await Customer.findAll({ where, order: [['id', 'DESC']] });
    res.json({ code: 0, data: list });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ code: 1, message: '不存在' });
    const salesOrders = await SalesOrder.findAll({
      where: { customerId: req.params.id },
      order: [['createdAt', 'DESC']]
    });
    const quotations = await Quotation.findAll({
      where: { customerId: req.params.id },
      order: [['createdAt', 'DESC']]
    });
    const payments = await Payment.findAll({
      where: { partnerId: req.params.id, partnerType: 'customer', type: 'receive' },
      order: [['createdAt', 'DESC']]
    });
    res.json({ code: 0, data: { ...customer.toJSON(), salesOrders, quotations, payments } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await Customer.create(req.body);
    res.json({ code: 0, data: item });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await Customer.findByPk(req.params.id);
    if (!item) return res.status(404).json({ code: 1, message: '不存在' });
    await item.update(req.body);
    res.json({ code: 0, data: item });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await Customer.findByPk(req.params.id);
    if (!item) return res.status(404).json({ code: 1, message: '不存在' });
    await item.destroy();
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
