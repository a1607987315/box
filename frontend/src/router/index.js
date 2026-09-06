import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('../views/dashboard/Index.vue'), meta: { title: '首页工作台' } },
      { path: 'products', name: 'Products', component: () => import('../views/products/Index.vue'), meta: { title: '商品列表' } },
      { path: 'suppliers', name: 'Suppliers', component: () => import('../views/suppliers/Index.vue'), meta: { title: '供应商' } },
      { path: 'customers', name: 'Customers', component: () => import('../views/customers/Index.vue'), meta: { title: '客户管理' } },
      { path: 'warehouses', name: 'Warehouses', component: () => import('../views/warehouses/Index.vue'), meta: { title: '仓库管理' } },
      { path: 'purchases', name: 'Purchases', component: () => import('../views/purchases/Index.vue'), meta: { title: '采购单' } },
      { path: 'purchases/new', name: 'PurchaseNew', component: () => import('../views/purchases/Form.vue'), meta: { title: '新建采购单' } },
      { path: 'purchases/:id', name: 'PurchaseDetail', component: () => import('../views/purchases/Detail.vue'), meta: { title: '采购单详情' } },
      { path: 'sales', name: 'Sales', component: () => import('../views/sales/Index.vue'), meta: { title: '销售订单' } },
      { path: 'sales/new', name: 'SalesNew', component: () => import('../views/sales/Form.vue'), meta: { title: '新建销售单' } },
      { path: 'sales/:id', name: 'SalesDetail', component: () => import('../views/sales/Detail.vue'), meta: { title: '销售单详情' } },
      { path: 'quotations', redirect: '/sales' },
      { path: 'quotations/new', redirect: '/sales/new' },
      { path: 'quotations/:id', redirect: '/sales' },
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
    redirect: (to) => `/print/sales/${to.params.id}`
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
