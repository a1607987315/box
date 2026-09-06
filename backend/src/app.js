const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { sequelize } = require('./models');
const { seedIfEmpty } = require('./utils/seed');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/products', require('./routes/products'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/warehouses', require('./routes/warehouses'));
app.use('/api/purchases', require('./routes/purchases'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/quotations', require('./routes/quotations'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ code: 1, message: err.message || '服务器内部错误' });
});

const PORT = process.env.PORT || 3000;

sequelize.sync().then(async () => {
  console.log('数据库同步完成');
  await seedIfEmpty();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`后端服务运行在 http://0.0.0.0:${PORT}`);
  });
}).catch(err => {
  console.error('数据库连接失败:', err);
});

module.exports = app;
