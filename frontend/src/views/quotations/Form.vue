<template>
  <el-card>
    <el-form :model="form" label-width="90px">
      <el-form-item label="客户">
        <el-select v-model="form.customerId" filterable style="width: 280px">
          <el-option v-for="c in customers" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="有效期"><el-date-picker v-model="form.validUntil" value-format="YYYY-MM-DD" /></el-form-item>
      <el-form-item label="折扣率%"><el-input-number v-model="form.discountRate" :min="0" :max="100" :precision="2" /></el-form-item>
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
      <el-table-column label="金额" width="110"><template #default="{ row }">{{ row.amount }}</template></el-table-column>
      <el-table-column width="70">
        <template #default="{ $index }">
          <el-button link type="danger" @click="form.items.splice($index, 1)">删</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="bar">
      <el-button @click="form.items.push(emptyItem())">加一行</el-button>
      <span>合计 {{ total }}　折后 {{ finalAmt }}</span>
      <el-button type="primary" @click="submit">保存报价单</el-button>
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
const form = reactive({ customerId: null, validUntil: '', discountRate: 0, remark: '', items: [emptyItem()] })

function emptyItem() {
  return { productId: null, quantity: 1, unitPrice: 0, amount: 0 }
}
function onProduct(row) {
  const p = products.value.find((x) => x.id === row.productId)
  if (!p) return
  row.unitPrice = Number(p.salesPrice)
  calc(row)
}
function calc(row) {
  row.amount = Math.round(Number(row.quantity) * Number(row.unitPrice) * 100) / 100
}
const total = computed(() => form.items.reduce((s, i) => s + Number(i.amount || 0), 0))
const finalAmt = computed(() => Math.round(total.value * (1 - Number(form.discountRate || 0) / 100) * 100) / 100)

async function submit() {
  if (!form.customerId) return ElMessage.warning('请选择客户')
  const items = form.items.filter((i) => i.productId)
  if (!items.length) return ElMessage.warning('请添加商品')
  const res = await http.post('/quotations', { ...form, items })
  ElMessage.success('已保存')
  router.push(`/quotations/${res.data.id}`)
}

onMounted(async () => {
  products.value = (await http.get('/products')).data
  customers.value = (await http.get('/customers')).data
})
</script>
<style scoped>
.bar { margin-top: 12px; display: flex; align-items: center; gap: 16px; }
</style>
