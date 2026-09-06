<template>
  <el-card v-if="quote">
    <div class="head">
      <h3>{{ quote.quoteNo }}</h3>
      <div>
        <el-tag>{{ { pending: '待确认', confirmed: '已确认', expired: '已过期', converted: '已转订单' }[quote.status] }}</el-tag>
        <el-button v-if="quote.status === 'pending'" type="success" class="ml" @click="showConvert = true">转销售订单</el-button>
        <el-button class="ml" @click="print">打印</el-button>
      </div>
    </div>
    <p>客户：{{ quote.Customer?.name }}　有效期：{{ quote.validUntil }}　折后金额：{{ quote.finalAmount }}</p>
    <el-table :data="quote.items || []" border>
      <el-table-column label="商品"><template #default="{ row }">{{ row.Product?.name }}</template></el-table-column>
      <el-table-column prop="quantity" label="数量" width="100" />
      <el-table-column prop="unitPrice" label="单价" width="100" />
      <el-table-column prop="amount" label="金额" width="100" />
    </el-table>
    <el-dialog v-model="showConvert" title="转为销售订单" width="420px">
      <el-form label-width="90px">
        <el-form-item label="出库仓库">
          <el-select v-model="warehouseId" style="width: 100%">
            <el-option v-for="w in warehouses" :key="w.id" :label="w.name" :value="w.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showConvert = false">取消</el-button>
        <el-button type="primary" @click="convert">确认转换</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import http from '../../api'

const route = useRoute()
const router = useRouter()
const quote = ref(null)
const showConvert = ref(false)
const warehouses = ref([])
const warehouseId = ref(null)

async function load() {
  quote.value = (await http.get(`/quotations/${route.params.id}`)).data
}
function print() {
  window.open(`/print/quotations/${route.params.id}`, '_blank')
}
async function convert() {
  if (!warehouseId.value) return ElMessage.warning('请选择仓库')
  const res = await http.post(`/quotations/${route.params.id}/convert`, { warehouseId: warehouseId.value })
  ElMessage.success('已转销售订单')
  router.push(`/sales/${res.data.id}`)
}
onMounted(async () => {
  await load()
  warehouses.value = (await http.get('/warehouses')).data
  if (warehouses.value[0]) warehouseId.value = warehouses.value[0].id
})
</script>
<style scoped>
.head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.ml { margin-left: 8px; }
</style>
