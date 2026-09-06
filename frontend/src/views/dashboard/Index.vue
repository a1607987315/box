<template>
  <div>
    <div class="welcome">进销存一体 · 采购、销售、库存、财务闭环</div>
    <el-row :gutter="16">
      <el-col :span="6" v-for="card in cards" :key="card.label">
        <el-card shadow="hover" class="stat" @click="$router.push(card.to)">
          <div class="label">{{ card.label }}</div>
          <div class="value" :style="{ color: card.color }">{{ money(card.value) }}</div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="16" class="mt">
      <el-col :span="16">
        <el-card>
          <template #header>
            <span>库存预警</span>
            <el-tag type="danger" size="small" style="margin-left:8px">需补货 {{ stats.lowStockCount }}</el-tag>
          </template>
          <el-table :data="lowStock" empty-text="暂无预警商品" size="small">
            <el-table-column label="SKU" width="120">
              <template #default="{ row }">{{ row.Product?.code }}</template>
            </el-table-column>
            <el-table-column label="商品">
              <template #default="{ row }">{{ row.Product?.name }}</template>
            </el-table-column>
            <el-table-column prop="quantity" label="当前库存" width="110" align="right" />
            <el-table-column label="安全库存" width="110" align="right">
              <template #default="{ row }">{{ row.Product?.safetyStock }}</template>
            </el-table-column>
            <el-table-column label="单位" width="80">
              <template #default="{ row }">{{ row.Product?.baseUnit }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card header="快捷入口">
          <el-button type="primary" class="full" @click="$router.push('/sales/new')">+ 新建销售单</el-button>
          <el-button class="full mt8" @click="$router.push('/purchases/new')">+ 新建采购单</el-button>
          <el-button class="full mt8" @click="$router.push('/products')">商品列表</el-button>
          <el-button class="full mt8" @click="$router.push('/inventory')">库存查询</el-button>
          <el-button class="full mt8" @click="$router.push('/payments')">收付款</el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue'
import http from '../../api'

const stats = reactive({
  todaySales: 0, todayPurchases: 0, totalReceivable: 0, totalPayable: 0, lowStockCount: 0
})
const lowStock = ref([])
const cards = computed(() => [
  { label: '今日销售额', value: stats.todaySales, to: '/sales', color: '#2f9e44' },
  { label: '今日采购额', value: stats.todayPurchases, to: '/purchases', color: '#1c7ed6' },
  { label: '应收款总额', value: stats.totalReceivable, to: '/payments', color: '#e8590c' },
  { label: '应付款总额', value: stats.totalPayable, to: '/payments', color: '#7048e8' }
])
function money(v) {
  return Number(v || 0).toFixed(2)
}
onMounted(async () => {
  const res = await http.get('/dashboard')
  Object.assign(stats, res.data)
  lowStock.value = (res.data.lowStockProducts || []).map((row) => ({ ...row, Product: row.Product || {} }))
})
</script>

<style scoped>
.welcome { margin-bottom: 14px; color: #606266; font-size: 14px; }
.stat { cursor: pointer; }
.label { color: #909399; font-size: 13px; }
.value { font-size: 26px; font-weight: 700; margin-top: 8px; }
.mt { margin-top: 16px; }
.mt8 { margin-top: 8px; margin-left: 0 !important; }
.full { width: 100%; }
</style>
