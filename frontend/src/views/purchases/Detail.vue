<template>
  <el-card v-if="order">
    <div class="head">
      <h3>{{ order.orderNo }}</h3>
      <div>
        <el-tag>{{ statusText(order.status) }}</el-tag>
        <el-button v-if="order.status === 'pending'" type="success" class="ml" @click="receive">确认入库</el-button>
      </div>
    </div>
    <p>供应商：{{ order.Supplier?.name }}　仓库：{{ order.Warehouse?.name }}　金额：{{ order.totalAmount }}</p>
    <el-table :data="order.items || []" border>
      <el-table-column label="商品"><template #default="{ row }">{{ row.Product?.name }}</template></el-table-column>
      <el-table-column prop="quantity" label="数量" width="100" />
      <el-table-column prop="unitPrice" label="单价" width="100" />
      <el-table-column prop="amount" label="金额" width="100" />
    </el-table>
  </el-card>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '../../api'

const route = useRoute()
const order = ref(null)
function statusText(s) {
  return { draft: '草稿', pending: '待入库', received: '已入库', cancelled: '已取消' }[s] || s
}
async function load() {
  order.value = (await http.get(`/purchases/${route.params.id}`)).data
}
async function receive() {
  await ElMessageBox.confirm('确认入库并更新库存、成本价、应付款？', '确认')
  await http.post(`/purchases/${route.params.id}/receive`)
  ElMessage.success('入库成功')
  load()
}
onMounted(load)
</script>
<style scoped>
.head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.ml { margin-left: 8px; }
</style>
