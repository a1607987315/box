<template>
  <div>
    <el-row :gutter="16">
      <el-col :span="6" v-for="card in cards" :key="card.label">
        <el-card shadow="hover" class="stat" @click="$router.push(card.to)">
          <div class="label">{{ card.label }}</div>
          <div class="value">{{ card.value }}</div>
        </el-card>
      </el-col>
    </el-row>
    <el-card class="mt" header="库存预警">
      <el-table :data="lowStock" empty-text="暂无预警商品">
        <el-table-column prop="Product.code" label="编号" width="120" />
        <el-table-column prop="Product.name" label="商品" />
        <el-table-column prop="quantity" label="当前库存" width="120" />
        <el-table-column prop="Product.safetyStock" label="安全库存" width="120" />
        <el-table-column prop="Product.baseUnit" label="单位" width="80" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue'
import http from '../../api'

const stats = reactive({
  todaySales: 0,
  todayPurchases: 0,
  totalReceivable: 0,
  totalPayable: 0,
  lowStockCount: 0
})
const lowStock = ref([])

const cards = computed(() => [
  { label: '今日销售额', value: stats.todaySales, to: '/sales' },
  { label: '今日采购额', value: stats.todayPurchases, to: '/purchases' },
  { label: '应收款总额', value: stats.totalReceivable, to: '/payments' },
  { label: '应付款总额', value: stats.totalPayable, to: '/payments' }
])

onMounted(async () => {
  const res = await http.get('/dashboard')
  Object.assign(stats, res.data)
  lowStock.value = (res.data.lowStockProducts || []).map((row) => ({
    ...row,
    Product: row.Product || {}
  }))
})
</script>

<style scoped>
.stat { cursor: pointer; }
.label { color: #909399; font-size: 13px; }
.value { font-size: 26px; font-weight: 700; margin-top: 8px; color: #303133; }
.mt { margin-top: 16px; }
</style>
