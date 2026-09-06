const { Product, Supplier, Customer, Warehouse } = require('../models');

async function seedIfEmpty() {
  const count = await Warehouse.count();
  if (count > 0) return false;

  await Warehouse.create({ code: 'WH001', name: '主仓库', address: '默认仓库', remark: '' });
  await Supplier.bulkCreate([
    { code: 'SUP001', name: '示例供应商A', contact: '张经理', phone: '13800138001', address: '供应商地址' }
  ]);
  await Customer.bulkCreate([
    { code: 'CUS001', name: '示例批发客户', contact: '李总', phone: '13900139001', address: '客户地址', level: 'wholesale' },
    { code: 'CUS002', name: '示例零售客户', contact: '王先生', phone: '13900139002', address: '客户地址', level: 'retail' }
  ]);
  await Product.bulkCreate([
    {
      code: 'PRD001', name: '示例线缆', category: '线材', spec: '2.5平方',
      baseUnit: '米', purchaseUnit: '公斤', purchaseRatio: 100,
      salesUnit: '米', salesRatio: 1,
      costPrice: 2.5, wholesalePrice: 3.5, salesPrice: 4.0, safetyStock: 50
    },
    {
      code: 'PRD002', name: '示例管材', category: '管材', spec: 'DN25',
      baseUnit: '根', purchaseUnit: '根', purchaseRatio: 1,
      salesUnit: '根', salesRatio: 1,
      costPrice: 15, wholesalePrice: 20, salesPrice: 25, safetyStock: 20
    }
  ]);
  console.log('已写入示例数据');
  return true;
}

if (require.main === module) {
  const { sequelize } = require('../models');
  sequelize.sync({ force: true }).then(() => seedIfEmpty()).then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { seedIfEmpty };
