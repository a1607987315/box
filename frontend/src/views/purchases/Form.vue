<template>
  <el-card>
    <el-form :model="form" label-width="90px">
      <el-form-item label="供应商">
        <el-select v-model="form.supplierId" filterable style="width: 280px">
          <el-option v-for="s in suppliers" :key="s.id" :label="s.name" :value="s.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="入库仓库">
        <el-select v-model="form.warehouseId" style="width: 280px">
          <el-option v-for="w in warehouses" :key="w.id" :label="w.name" :value="w.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="备注"><el-input v-model="form.remark" style="width: 480px" /></el-form-item>
    </el-form>
    <el-table :data="form.items" border>
      <el-table-column label="商品" min-width="220">
        <template #default="{ row }">
          <el-select v-model="row.productId" filterable @change="onProduct(row)">
            <el-option v-for="p in products" :key="p.id" :label="`${p.code} ${p.name}`" :value="p.id" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="单位" width="90">
        <template #default="{ row }">{{ row.unit }}</template>
      </el-table-column>
      <el-table-column label="数量" width="140">
        <template #default="{ row }">
          <el-input-number v-model="row.quantity" :min="0.0001" :precision="4" @change="calc(row)" />
        </template>
      </el-table-column>
      <el-table-column label="单价" width="140">
        <template #default="{ row }">
          <el-input-number v-model="row.unitPrice" :min="0" :precision="2" @change="calc(row)" />
        </template>
      </el-table-column>
      <el-table-column label="金额" width="110">
        <template #default="{ row }">{{ row.amount }}</template>
      </el-table-column>
      <el-table-column label="" width="80">
        <template #default="{ $index }">
          <el-button link type="danger" @click="form.items.splice($index, 1)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="bar">
      <el-button @click="form.items.push(emptyItem())">加一行</el-button>
      <span class="total">合计：{{ total }}</span>
      <el-button type="primary" @click="submit">保存采购单</el-button>
    </div>
  </el-card>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import http from '../../api'

const router = useRouter()
const products = ref([])
const suppliers = ref([])
const warehouses = ref([])
const form = reactive({ supplierId: null, warehouseId: null, remark: '', items: [emptyItem()] })

function emptyItem() {
  return { productId: null, unit: '', quantity: 1, unitPrice: 0, amount: 0 }
}
function onProduct(row) {
  const p = products.value.find((x) => x.id === row.productId)
  if (!p) return
  row.unit = p.purchaseUnit || p.baseUnit
  row.unitPrice = Number(p.costPrice) * Number(p.purchaseRatio || 1)
  calc(row)
}
function calc(row) {
  row.amount = Math.round(Number(row.quantity) * Number(row.unitPrice) * 100) / 100
}
const total = computed(() => form.items.reduce((s, i) => s + Number(i.amount || 0), 0).toFixed(2))

async function submit() {
  if (!form.supplierId || !form.warehouseId) return ElMessage.warning('请选择供应商和仓库')
  const items = form.items.filter((i) => i.productId)
  if (!items.length) return ElMessage.warning('请添加商品')
  const res = await http.post('/purchases', { ...form, items })
  ElMessage.success('已保存')
  router.push(`/purchases/${res.data.id}`)
}

onMounted(async () => {
  products.value = (await http.get('/products')).data
  suppliers.value = (await http.get('/suppliers')).data
  warehouses.value = (await http.get('/warehouses')).data
  if (warehouses.value[0]) form.warehouseId = warehouses.value[0].id
})
</script>
<style scoped>
.bar { margin-top: 12px; display: flex; align-items: center; gap: 12px; }
.total { font-weight: 700; }
</style>
