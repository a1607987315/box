import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('../views/dashboard/Index.vue'), meta: { title: '首页' } },
      { path: 'products', name: 'Products', component: () => import('../views/products/Index.vue'), meta: { title: '商品管理' } },
      { path: 'suppliers', name: 'Suppliers', component: () => import('../views/suppliers/Index.vue'), meta: { title: '供应商' } },
      { path: 'customers', name: 'Customers', component: () => import('../views/customers/Index.vue'), meta: { title: '客户管理' } },
      { path: 'warehouses', name: 'Warehouses', component: () => import('../views/warehouses/Index.vue'), meta: { title: '仓库管理' } },
      { path: 'purchases', name: 'Purchases', component: () => import('../views/purchases/Index.vue'), meta: { title: '采购单' } },
      { path: 'purchases/new', name: 'PurchaseNew', component: () => import('../views/purchases/Form.vue'), meta: { title: '新建采购单' } },
      { path: 'purchases/:id', name: 'PurchaseDetail', component: () => import('../views/purchases/Detail.vue'), meta: { title: '采购单详情' } },
      { path: 'sales', name: 'Sales', component: () => import('../views/sales/Index.vue'), meta: { title: '销售订单' } },
      { path: 'sales/new', name: 'SalesNew', component: () => import('../views/sales/Form.vue'), meta: { title: '新建销售订单' } },
      { path: 'sales/:id', name: 'SalesDetail', component: () => import('../views/sales/Detail.vue'), meta: { title: '销售订单详情' } },
      { path: 'quotations', name: 'Quotations', component: () => import('../views/quotations/Index.vue'), meta: { title: '报价单' } },
      { path: 'quotations/new', name: 'QuotationNew', component: () => import('../views/quotations/Form.vue'), meta: { title: '新建报价单' } },
      { path: 'quotations/:id', name: 'QuotationDetail', component: () => import('../views/quotations/Detail.vue'), meta: { title: '报价单详情' } },
      { path: 'inventory', name: 'Inventory', component: () => import('../views/inventory/Index.vue'), meta: { title: '库存查询' } },
      { path: 'inventory/transactions', name: 'InventoryTx', component: () => import('../views/inventory/Transactions.vue'), meta: { title: '库存流水' } },
      { path: 'payments', name: 'Payments', component: () => import('../views/payments/Index.vue'), meta: { title: '收付款' } }
    ]
  },
  {
    path: '/print/sales/:id',
    name: 'PrintSales',
    component: () => import('../views/sales/Print.vue')
  },
  {
    path: '/print/quotations/:id',
    name: 'PrintQuotation',
    component: () => import('../views/quotations/Print.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} - 供销存管理系统` : '供销存管理系统'
})

export default router
