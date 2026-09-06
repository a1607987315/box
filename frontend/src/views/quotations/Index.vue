<template>
  <el-card>
    <div class="toolbar">
      <el-input v-model="keyword" placeholder="报价单号" clearable style="width: 220px" @keyup.enter="load" />
      <el-button type="primary" @click="load">查询</el-button>
      <el-button type="success" @click="$router.push('/quotations/new')">新建报价单</el-button>
    </div>
    <el-table :data="list" stripe>
      <el-table-column prop="quoteNo" label="单号" width="200" />
      <el-table-column label="客户"><template #default="{ row }">{{ row.Customer?.name }}</template></el-table-column>
      <el-table-column prop="finalAmount" label="报价金额" width="120" />
      <el-table-column prop="validUntil" label="有效期" width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">{{ { pending: '待确认', confirmed: '已确认', expired: '已过期', converted: '已转订单' }[row.status] }}</template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button link type="primary" @click="$router.push(`/quotations/${row.id}`)">详情</el-button>
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
async function load() {
  list.value = (await http.get('/quotations', { params: { keyword: keyword.value } })).data
}
onMounted(load)
</script>
<style scoped>
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
</style>
