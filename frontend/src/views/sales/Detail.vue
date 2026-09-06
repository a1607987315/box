<template>
  <el-card v-if="order">
    <div class="head">
      <h3>{{ order.orderNo }}</h3>
      <div>
        <el-tag>{{ { pending: '待出库', shipped: '已出库', cancelled: '已取消', draft: '草稿' }[order.status] }}</el-tag>
        <el-button v-if="order.status === 'pending'" type="success" class="ml" @click="ship">确认出库</el-button>
        <el-button class="ml" @click="print">打印</el-button>
      </div>
    </div>
    <p>客户：{{ order.Customer?.name }}　仓库：{{ order.Warehouse?.name }}</p>
    <p>商品金额 {{ order.totalAmount }}　运费 {{ order.freight }}　折扣 {{ order.discountAmount }}　应收 {{ order.receivableAmount }}</p>
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
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '../../api'

const route = useRoute()
const router = useRouter()
const order = ref(null)
async function load() {
  order.value = (await http.get(`/sales/${route.params.id}`)).data
}
async function ship() {
  await ElMessageBox.confirm('确认出库并更新库存、应收款、历史价格？', '确认')
  await http.post(`/sales/${route.params.id}/ship`)
  ElMessage.success('出库成功')
  load()
}
function print() {
  window.open(`/print/sales/${route.params.id}`, '_blank')
}
onMounted(load)
</script>
<style scoped>
.head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.ml { margin-left: 8px; }
</style>
