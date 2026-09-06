<template>
  <el-card>
    <div class="toolbar">
      <el-input v-model="keyword" placeholder="搜索编号/名称" clearable style="width: 240px" @keyup.enter="load" />
      <el-button type="primary" @click="load">查询</el-button>
      <el-button type="success" @click="open()">+ 新增商品</el-button>
    </div>
    <el-table :data="list" stripe>
      <el-table-column prop="code" label="SKU编号" width="120" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="category" label="分类" width="100" />
      <el-table-column prop="spec" label="规格" width="100" />
      <el-table-column prop="baseUnit" label="基础单位" width="90" />
      <el-table-column prop="purchaseUnit" label="采购单位" width="90" />
      <el-table-column prop="purchaseRatio" label="采购换算" width="90" />
      <el-table-column prop="salesUnit" label="销售单位" width="90" />
      <el-table-column prop="costPrice" label="成本价" width="90" />
      <el-table-column prop="wholesalePrice" label="批发价" width="90" />
      <el-table-column prop="salesPrice" label="销售价" width="90" />
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="open(row)">编辑</el-button>
          <el-button link type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="visible" :title="form.id ? '编辑商品' : '新增商品'" width="640px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="SKU编号" required><el-input v-model="form.code" :disabled="!!form.id" placeholder="必填，创建后不可改" /></el-form-item>
        <el-form-item label="名称" required><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="分类"><el-input v-model="form.category" /></el-form-item>
        <el-form-item label="规格"><el-input v-model="form.spec" /></el-form-item>
        <el-form-item label="基础单位"><el-input v-model="form.baseUnit" /></el-form-item>
        <el-form-item label="采购单位"><el-input v-model="form.purchaseUnit" /></el-form-item>
        <el-form-item label="采购换算率"><el-input-number v-model="form.purchaseRatio" :min="0.0001" :precision="4" /></el-form-item>
        <el-form-item label="销售单位"><el-input v-model="form.salesUnit" /></el-form-item>
        <el-form-item label="销售换算率"><el-input-number v-model="form.salesRatio" :min="0.0001" :precision="4" /></el-form-item>
        <el-form-item label="成本价"><el-input-number v-model="form.costPrice" :min="0" :precision="2" /></el-form-item>
        <el-form-item label="批发价"><el-input-number v-model="form.wholesalePrice" :min="0" :precision="2" /></el-form-item>
        <el-form-item label="销售价"><el-input-number v-model="form.salesPrice" :min="0" :precision="2" /></el-form-item>
        <el-form-item label="安全库存"><el-input-number v-model="form.safetyStock" :min="0" :precision="4" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '../../api'

const list = ref([])
const keyword = ref('')
const visible = ref(false)
const form = reactive(empty())

function empty() {
  return {
    id: null, code: '', name: '', category: '', spec: '',
    baseUnit: '米', purchaseUnit: '公斤', purchaseRatio: 1,
    salesUnit: '米', salesRatio: 1, costPrice: 0, wholesalePrice: 0,
    salesPrice: 0, safetyStock: 0, remark: ''
  }
}

async function load() {
  const res = await http.get('/products', { params: { keyword: keyword.value } })
  list.value = res.data
}

function open(row) {
  Object.assign(form, empty(), row || {})
  visible.value = true
}

async function save() {
  if (!String(form.code || '').trim()) return ElMessage.warning('SKU编号必填')
  if (!String(form.name || '').trim()) return ElMessage.warning('商品名称必填')
  if (form.id) await http.put(`/products/${form.id}`, form)
  else await http.post('/products', form)
  ElMessage.success('保存成功')
  visible.value = false
  load()
}

async function remove(row) {
  await ElMessageBox.confirm(`确认删除商品 ${row.name}？`, '提示')
  await http.delete(`/products/${row.id}`)
  ElMessage.success('已删除')
  load()
}

onMounted(load)
</script>

<style scoped>
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
</style>
