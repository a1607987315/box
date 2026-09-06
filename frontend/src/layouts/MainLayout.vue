<template>
  <el-container class="layout">
    <el-aside :width="collapsed ? '64px' : '220px'" class="aside">
      <div class="logo" @click="$router.push('/dashboard')">
        <span v-if="!collapsed">供销存</span>
        <span v-else>SB</span>
      </div>
      <el-menu
        :default-active="active"
        :collapse="collapsed"
        router
        background-color="#0f1c2e"
        text-color="#c5d0de"
        active-text-color="#69db7c"
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>首页工作台</span>
        </el-menu-item>
        <el-sub-menu index="base">
          <template #title>
            <el-icon><Goods /></el-icon>
            <span>基础资料</span>
          </template>
          <el-menu-item index="/products">商品列表</el-menu-item>
          <el-menu-item index="/suppliers">供应商</el-menu-item>
          <el-menu-item index="/customers">客户</el-menu-item>
          <el-menu-item index="/warehouses">仓库</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="purchase">
          <template #title>
            <el-icon><ShoppingCart /></el-icon>
            <span>采购管理</span>
          </template>
          <el-menu-item index="/purchases">采购订单</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="sales">
          <template #title>
            <el-icon><Tickets /></el-icon>
            <span>销售管理</span>
          </template>
          <el-menu-item index="/sales">销售订单</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="stock">
          <template #title>
            <el-icon><Box /></el-icon>
            <span>库存管理</span>
          </template>
          <el-menu-item index="/inventory">库存查询</el-menu-item>
          <el-menu-item index="/inventory/transactions">库存流水</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="finance">
          <template #title>
            <el-icon><Wallet /></el-icon>
            <span>财务管理</span>
          </template>
          <el-menu-item index="/payments">收付款</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <el-icon class="fold" @click="collapsed = !collapsed"><Fold v-if="!collapsed" /><Expand v-else /></el-icon>
        <span class="crumb">供销存管理系统</span>
        <span class="spacer" />
        <span class="title">{{ $route.meta.title || '工作台' }}</span>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const collapsed = ref(false)
const active = computed(() => {
  const p = route.path
  if (p.startsWith('/purchases')) return '/purchases'
  if (p.startsWith('/sales')) return '/sales'
  if (p.startsWith('/products')) return '/products'
  if (p.startsWith('/inventory/transactions')) return '/inventory/transactions'
  if (p.startsWith('/inventory')) return '/inventory'
  return p
})
</script>

<style scoped>
.layout { height: 100vh; }
.aside { background: #0f1c2e; overflow-y: auto; transition: width .2s; }
.logo {
  height: 56px; line-height: 56px; text-align: center; color: #69db7c;
  font-size: 18px; font-weight: 800; letter-spacing: 1px; cursor: pointer;
}
.header {
  background: #fff; border-bottom: 1px solid #ebeef5;
  display: flex; align-items: center; gap: 12px;
}
.fold { cursor: pointer; font-size: 18px; }
.crumb { color: #909399; font-size: 13px; }
.spacer { flex: 1; }
.title { font-size: 15px; font-weight: 600; color: #303133; }
.main { background: #f4f6f9; }
.el-menu { border-right: none; }
</style>
