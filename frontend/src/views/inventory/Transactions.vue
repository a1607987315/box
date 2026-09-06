<template>
  <el-card>
    <div class="toolbar">
      <el-select v-model="type" clearable placeholder="类型" style="width: 160px" @change="load">
        <el-option label="采购入库" value="purchase_in" />
        <el-option label="销售出库" value="sales_out" />
        <el-option label="调拨出库" value="transfer_out" />
        <el-option label="调拨入库" value="transfer_in" />
        <el-option label="盘盈" value="adjust_in" />
        <el-option label="盘亏" value="adjust_out" />
      </el-select>
      <el-button type="primary" @click="load">查询</el-button>
    </div>
    <el-table :data="list" stripe>
      <el-table-column prop="createdAt" label="时间" width="180" />
      <el-table-column label="商品"><template #default="{ row }">{{ row.Product?.name }}</template></el-table-column>
      <el-table-column label="仓库"><template #default="{ row }">{{ row.Warehouse?.name }}</template></el-table-column>
      <el-table-column prop="type" label="类型" width="110">
        <template #default="{ row }">{{ typeMap[row.type] || row.type }}</template>
      </el-table-column>
      <el-table-column prop="quantity" label="数量" width="100" />
      <el-table-column prop="balanceAfter" label="结余" width="100" />
      <el-table-column prop="refNo" label="单据号" width="200" />
    </el-table>
  </el-card>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import http from '../../api'

const list = ref([])
const type = ref('')
const typeMap = {
  purchase_in: '采购入库', sales_out: '销售出库',
  transfer_out: '调拨出库', transfer_in: '调拨入库',
  adjust_in: '盘盈', adjust_out: '盘亏'
}
async function load() {
  list.value = (await http.get('/inventory/transactions', { params: { type: type.value } })).data
}
onMounted(load)
</script>
<style scoped>
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
</style>
