<template>
  <el-card>
    <div class="toolbar">
      <el-input v-model="keyword" placeholder="销售单号" clearable style="width: 220px" @keyup.enter="load" />
      <el-select v-model="status" clearable placeholder="状态" style="width: 140px" @change="load">
        <el-option label="待出库" value="pending" />
        <el-option label="已出库" value="shipped" />
        <el-option label="已取消" value="cancelled" />
      </el-select>
      <el-button type="primary" @click="load">查询</el-button>
      <el-button type="success" @click="$router.push('/sales/new')">+ 新建销售单</el-button>
    </div>
    <el-table :data="list" stripe>
      <el-table-column prop="orderNo" label="单号" width="200" />
      <el-table-column label="客户"><template #default="{ row }">{{ row.Customer?.name }}</template></el-table-column>
      <el-table-column prop="totalAmount" label="商品金额" width="110" align="right" />
      <el-table-column prop="freight" label="运费" width="90" align="right" />
      <el-table-column prop="discountAmount" label="折扣" width="90" align="right" />
      <el-table-column prop="receivableAmount" label="应收" width="110" align="right" />
      <el-table-column prop="status" label="状态" width="90">
        <template #default="{ row }">{{ { pending: '待出库', shipped: '已出库', cancelled: '已取消', draft: '草稿' }[row.status] }}</template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button link type="primary" @click="$router.push(`/sales/${row.id}`)">详情</el-button>
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
async function load() {
  list.value = (await http.get('/sales', { params: { keyword: keyword.value, status: status.value } })).data
}
onMounted(load)
</script>
<style scoped>
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
</style>
