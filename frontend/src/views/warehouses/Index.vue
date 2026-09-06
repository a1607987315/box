<template>
  <el-card>
    <div class="toolbar">
      <el-button type="success" @click="open()">新增仓库</el-button>
      <el-button @click="showTransfer = true">仓库调拨</el-button>
    </div>
    <el-table :data="list" stripe>
      <el-table-column prop="code" label="编号" width="120" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="address" label="地址" />
      <el-table-column prop="remark" label="备注" />
      <el-table-column label="操作" width="140">
        <template #default="{ row }">
          <el-button link type="primary" @click="open(row)">编辑</el-button>
          <el-button link type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="visible" :title="form.id ? '编辑仓库' : '新增仓库'" width="480px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="编号"><el-input v-model="form.code" :disabled="!!form.id" /></el-form-item>
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="地址"><el-input v-model="form.address" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="showTransfer" title="仓库调拨" width="520px">
      <el-form :model="tf" label-width="90px">
        <el-form-item label="调出仓库">
          <el-select v-model="tf.fromWarehouseId" style="width: 100%">
            <el-option v-for="w in list" :key="w.id" :label="w.name" :value="w.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="调入仓库">
          <el-select v-model="tf.toWarehouseId" style="width: 100%">
            <el-option v-for="w in list" :key="w.id" :label="w.name" :value="w.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品">
          <el-select v-model="tf.productId" filterable style="width: 100%">
            <el-option v-for="p in products" :key="p.id" :label="`${p.code} ${p.name}`" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="数量"><el-input-number v-model="tf.quantity" :min="0.0001" :precision="4" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="tf.remark" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showTransfer = false">取消</el-button>
        <el-button type="primary" @click="doTransfer">确认调拨</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '../../api'

const list = ref([])
const products = ref([])
const visible = ref(false)
const showTransfer = ref(false)
const form = reactive({ id: null, code: '', name: '', address: '', remark: '' })
const tf = reactive({ fromWarehouseId: null, toWarehouseId: null, productId: null, quantity: 1, remark: '' })

async function load() {
  const res = await http.get('/warehouses')
  list.value = res.data
}
async function loadProducts() {
  const res = await http.get('/products')
  products.value = res.data
}
function open(row) {
  Object.assign(form, { id: null, code: '', name: '', address: '', remark: '' }, row || {})
  visible.value = true
}
async function save() {
  if (form.id) await http.put(`/warehouses/${form.id}`, form)
  else await http.post('/warehouses', form)
  ElMessage.success('保存成功')
  visible.value = false
  load()
}
async function remove(row) {
  await ElMessageBox.confirm(`确认删除 ${row.name}？`, '提示')
  await http.delete(`/warehouses/${row.id}`)
  ElMessage.success('已删除')
  load()
}
async function doTransfer() {
  await http.post('/warehouses/transfer', tf)
  ElMessage.success('调拨成功')
  showTransfer.value = false
}
onMounted(() => { load(); loadProducts() })
</script>
<style scoped>
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
</style>
