<template>
  <el-card>
    <el-form :model="form" label-width="90px">
      <el-form-item label="客户">
        <el-select v-model="form.customerId" filterable style="width: 280px" @change="onCustomer">
          <el-option v-for="c in customers" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="出库仓库">
        <el-select v-model="form.warehouseId" style="width: 280px">
          <el-option v-for="w in warehouses" :key="w.id" :label="w.name" :value="w.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="客户规格"><el-input v-model="form.customerSpec" style="width: 280px" placeholder="选客户自动带出，可修改" /></el-form-item>
      <el-form-item label="运费(元)"><el-input-number v-model="form.freight" :min="0" :precision="2" /></el-form-item>
      <el-form-item label="整单折扣">
        <el-radio-group v-model="form.discountType">
          <el-radio label="none">无</el-radio>
          <el-radio label="rate">折扣率%</el-radio>
          <el-radio label="amount">折扣金额</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="form.discountType !== 'none'" label="折扣值">
        <el-input-number v-model="form.discountValue" :min="0" :precision="2" />
      </el-form-item>
      <el-form-item label="备注"><el-input v-model="form.remark" style="width: 480px" /></el-form-item>
    </el-form>
    <el-table :data="form.items" border>
      <el-table-column label="SKU编号" width="120">
        <template #default="{ row }">{{ row.sku }}</template>
      </el-table-column>
      <el-table-column label="商品" min-width="220">
        <template #default="{ row }">
          <el-select v-model="row.productId" filterable @change="onProduct(row)">
            <el-option v-for="p in products" :key="p.id" :label="`${p.code} ${p.name}`" :value="p.id" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="单位" width="80"><template #default="{ row }">{{ row.unit }}</template></el-table-column>
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
      <el-table-column label="历史价" min-width="180">
        <template #default="{ row }">
          <el-button v-for="h in row.history" :key="h.id" size="small" @click="row.unitPrice = Number(h.unitPrice); calc(row)">
            {{ h.unitPrice }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="金额" width="110" align="right">
        <template #default="{ row }">{{ Number(row.amount || 0).toFixed(2) }}</template>
      </el-table-column>
      <el-table-column width="70">
        <template #default="{ $index }">
          <el-button link type="danger" @click="form.items.splice($index, 1)">删</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="bar">
      <el-button @click="form.items.push(emptyItem())">加一行</el-button>
      <span class="sum">商品合计 {{ money(goodsTotal) }}　运费 {{ money(form.freight) }}　整单折扣 {{ money(discountAmt) }}　折后应收 ¥{{ money(receivable) }}</span>
      <el-button type="primary" @click="submit">保存销售单</el-button>
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
const customers = ref([])
const warehouses = ref([])
const currentCustomer = ref(null)
const form = reactive({
  customerId: null, warehouseId: null, freight: 0, customerSpec: '',
  discountType: 'none', discountValue: 0, remark: '', items: [emptyItem()]
})

function emptyItem() {
  return { productId: null, sku: '', unit: '', quantity: 1, unitPrice: 0, amount: 0, history: [] }
}
function onCustomer() {
  currentCustomer.value = customers.value.find((c) => c.id === form.customerId)
  form.customerSpec = currentCustomer.value?.name || ''
}
function money(v) {
  return Number(v || 0).toFixed(2)
}
async function onProduct(row) {
  const p = products.value.find((x) => x.id === row.productId)
  if (!p) return
  row.sku = p.code
  row.unit = p.salesUnit || p.baseUnit
  const level = currentCustomer.value?.level
  row.unitPrice = Number(level === 'wholesale' ? p.wholesalePrice : p.salesPrice) * Number(p.salesRatio || 1)
  calc(row)
  if (form.customerId && row.productId) {
    try {
      const res = await http.get('/sales/price-history', { params: { productId: row.productId, customerId: form.customerId } })
      row.history = res.data || []
      if (row.history[0]) {
        row.unitPrice = Number(row.history[0].unitPrice)
        calc(row)
      }
    } catch {
      row.history = []
    }
  }
}
function calc(row) {
  row.amount = Math.round(Number(row.quantity) * Number(row.unitPrice) * 100) / 100
}
const goodsTotal = computed(() => form.items.reduce((s, i) => s + Number(i.amount || 0), 0))
const discountAmt = computed(() => {
  if (form.discountType === 'rate') return Math.round(goodsTotal.value * Number(form.discountValue) / 100 * 100) / 100
  if (form.discountType === 'amount') return Number(form.discountValue) || 0
  return 0
})
const receivable = computed(() => Math.round((goodsTotal.value + Number(form.freight) - discountAmt.value) * 100) / 100)

async function submit() {
  if (!form.customerId || !form.warehouseId) return ElMessage.warning('请选择客户和仓库')
  const items = form.items.filter((i) => i.productId)
  if (!items.length) return ElMessage.warning('请选择商品，SKU编号必选')
  const res = await http.post('/sales', { ...form, items })
  ElMessage.success('已保存')
  router.push(`/sales/${res.data.id}`)
}

onMounted(async () => {
  products.value = (await http.get('/products')).data
  customers.value = (await http.get('/customers')).data
  warehouses.value = (await http.get('/warehouses')).data
  if (warehouses.value[0]) form.warehouseId = warehouses.value[0].id
})
</script>
<style scoped>
.bar { margin-top: 12px; display: flex; align-items: center; gap: 16px; }
.sum { margin-left: auto; font-weight: 700; }
</style>
