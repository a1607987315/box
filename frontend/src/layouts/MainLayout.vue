<template>
  <el-container class="layout">
    <el-aside width="220px" class="aside">
      <div class="logo">供销存管理</div>
      <el-menu :default-active="active" router background-color="#1d2b3a" text-color="#cfd8e3" active-text-color="#67c23a">
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>首页仪表盘</span>
        </el-menu-item>
        <el-sub-menu index="base">
          <template #title>
            <el-icon><Goods /></el-icon>
            <span>基础资料</span>
          </template>
          <el-menu-item index="/products">商品管理</el-menu-item>
          <el-menu-item index="/suppliers">供应商</el-menu-item>
          <el-menu-item index="/customers">客户管理</el-menu-item>
          <el-menu-item index="/warehouses">仓库管理</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="biz">
          <template #title>
            <el-icon><Tickets /></el-icon>
            <span>进销业务</span>
          </template>
          <el-menu-item index="/purchases">采购单</el-menu-item>
          <el-menu-item index="/sales">销售单</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="stock">
          <template #title>
            <el-icon><Box /></el-icon>
            <span>库存</span>
          </template>
          <el-menu-item index="/inventory">库存查询</el-menu-item>
          <el-menu-item index="/inventory/transactions">库存流水</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/payments">
          <el-icon><Wallet /></el-icon>
          <span>收付款</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <span class="title">{{ $route.meta.title || '供销存管理系统' }}</span>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const active = computed(() => {
  const p = route.path
  if (p.startsWith('/purchases')) return '/purchases'
  if (p.startsWith('/sales')) return '/sales'
  if (p.startsWith('/quotations')) return '/quotations'
  return p
})
</script>

<style scoped>
.layout { height: 100vh; }
.aside { background: #1d2b3a; overflow-y: auto; }
.logo { height: 56px; line-height: 56px; text-align: center; color: #fff; font-size: 18px; font-weight: 700; letter-spacing: 2px; }
.header { background: #fff; border-bottom: 1px solid #ebeef5; display: flex; align-items: center; }
.title { font-size: 16px; font-weight: 600; color: #303133; }
.main { background: #f5f7fa; }
.el-menu { border-right: none; }
</style>
