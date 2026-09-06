<template>
  <el-card>
    <div class="toolbar">
      <el-input v-model="keyword" placeholder="采购单号" clearable style="width: 220px" @keyup.enter="load" />
      <el-select v-model="status" clearable placeholder="状态" style="width: 140px" @change="load">
        <el-option label="待入库" value="pending" />
        <el-option label="已入库" value="received" />
        <el-option label="已取消" value="cancelled" />
      </el-select>
      <el-button type="primary" @click="load">查询</el-button>
      <el-button type="success" @click="$router.push('/purchases/new')">新建采购单</el-button>
    </div>
    <el-table :data="list" stripe>
      <el-table-column prop="orderNo" label="单号" width="200" />
      <el-table-column label="供应商">
        <template #default="{ row }">{{ row.Supplier?.name }}</template>
      </el-table-column>
      <el-table-column label="仓库">
        <template #default="{ row }">{{ row.Warehouse?.name }}</template>
      </el-table-column>
      <el-table-column prop="totalAmount" label="金额" width="110" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">{{ statusText(row.status) }}</template>
      </el-table-column>
      <el-table-column prop="payStatus" label="付款" width="90">
        <template #default="{ row }">{{ payText(row.payStatus) }}</template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="170" />
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button link type="primary" @click="$router.push(`/purchases/${row.id}`)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import http from '../../api'

const list = ref([])
const keyword = ref('')
const status = ref('')

function statusText(s) {
  return { draft: '草稿', pending: '待入库', received: '已入库', cancelled: '已取消' }[s] || s
}
function payText(s) {
  return { unpaid: '未付', partial: '部分付', paid: '已付' }[s] || s
}
async function load() {
  const res = await http.get('/purchases', { params: { keyword: keyword.value, status: status.value } })
  list.value = res.data
}
onMounted(load)
</script>
<style scoped>
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
</style>
