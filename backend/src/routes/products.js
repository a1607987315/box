const router = require('express').Router();
const { Op } = require('sequelize');
const { Product, Inventory } = require('../models');
const { Warehouse } = require('../models');

router.get('/', async (req, res) => {
  try {
    const { keyword, category } = req.query;
    const where = {};
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { code: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (category) where.category = category;
    const products = await Product.findAll({ where, order: [['id', 'DESC']] });
    res.json({ code: 0, data: products });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Inventory, include: [Warehouse] }]
    });
    if (!product) return res.status(404).json({ code: 1, message: '商品不存在' });
    res.json({ code: 0, data: product });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const code = String(req.body.code || '').trim();
    const name = String(req.body.name || '').trim();
    if (!code) return res.status(400).json({ code: 1, message: 'SKU编号必填' });
    if (!name) return res.status(400).json({ code: 1, message: '商品名称必填' });
    const exist = await Product.findOne({ where: { code } });
    if (exist) return res.status(400).json({ code: 1, message: 'SKU编号已存在' });
    const product = await Product.create({ ...req.body, code, name });
    res.json({ code: 0, data: product });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ code: 1, message: '商品不存在' });
    await product.update(req.body);
    res.json({ code: 0, data: product });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ code: 1, message: '商品不存在' });
    await product.destroy();
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
