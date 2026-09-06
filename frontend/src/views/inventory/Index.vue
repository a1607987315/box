<template>
  <el-card>
    <div class="toolbar">
      <el-select v-model="warehouseId" clearable placeholder="仓库" style="width: 180px" @change="load">
        <el-option v-for="w in warehouses" :key="w.id" :label="w.name" :value="w.id" />
      </el-select>
      <el-input v-model="keyword" placeholder="商品编号/名称" clearable style="width: 220px" @keyup.enter="load" />
      <el-button type="primary" @click="load">查询</el-button>
      <el-button @click="showAdjust = true">盘点调整</el-button>
    </div>
    <el-table :data="list" stripe>
      <el-table-column label="商品"><template #default="{ row }">{{ row.Product?.code }} {{ row.Product?.name }}</template></el-table-column>
      <el-table-column label="仓库"><template #default="{ row }">{{ row.Warehouse?.name }}</template></el-table-column>
      <el-table-column prop="quantity" label="库存(基础单位)" width="140" />
      <el-table-column label="单位" width="90"><template #default="{ row }">{{ row.Product?.baseUnit }}</template></el-table-column>
    </el-table>
    <el-dialog v-model="showAdjust" title="盘点调整" width="480px">
      <el-form :model="adj" label-width="90px">
        <el-form-item label="仓库">
          <el-select v-model="adj.warehouseId" style="width: 100%">
            <el-option v-for="w in warehouses" :key="w.id" :label="w.name" :value="w.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品">
          <el-select v-model="adj.productId" filterable style="width: 100%">
            <el-option v-for="p in products" :key="p.id" :label="`${p.code} ${p.name}`" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="调整数量"><el-input-number v-model="adj.quantity" :precision="4" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="adj.remark" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAdjust = false">取消</el-button>
        <el-button type="primary" @click="adjust">确认</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import http from '../../api'

const list = ref([])
const warehouses = ref([])
const products = ref([])
const warehouseId = ref('')
const keyword = ref('')
const showAdjust = ref(false)
const adj = reactive({ warehouseId: null, productId: null, quantity: 0, remark: '' })

async function load() {
  list.value = (await http.get('/inventory', { params: { warehouseId: warehouseId.value, keyword: keyword.value } })).data
}
async function adjust() {
  await http.post('/inventory/adjust', adj)
  ElMessage.success('调整成功')
  showAdjust.value = false
  load()
}
onMounted(async () => {
  warehouses.value = (await http.get('/warehouses')).data
  products.value = (await http.get('/products')).data
  load()
})
</script>
<style scoped>
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
</style>
