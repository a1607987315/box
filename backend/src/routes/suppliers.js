const router = require('express').Router();
const { Op } = require('sequelize');
const { Supplier, PurchaseOrder, Payment } = require('../models');

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
    const list = await Supplier.findAll({ where, order: [['id', 'DESC']] });
    res.json({ code: 0, data: list });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ code: 1, message: '不存在' });
    const purchaseOrders = await PurchaseOrder.findAll({
      where: { supplierId: req.params.id },
      order: [['createdAt', 'DESC']]
    });
    const payments = await Payment.findAll({
      where: { partnerId: req.params.id, partnerType: 'supplier', type: 'pay' },
      order: [['createdAt', 'DESC']]
    });
    res.json({ code: 0, data: { ...supplier.toJSON(), purchaseOrders, payments } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await Supplier.create(req.body);
    res.json({ code: 0, data: item });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await Supplier.findByPk(req.params.id);
    if (!item) return res.status(404).json({ code: 1, message: '不存在' });
    await item.update(req.body);
    res.json({ code: 0, data: item });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await Supplier.findByPk(req.params.id);
    if (!item) return res.status(404).json({ code: 1, message: '不存在' });
    await item.destroy();
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
