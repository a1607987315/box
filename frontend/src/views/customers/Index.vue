<template>
  <el-card>
    <div class="toolbar">
      <el-input v-model="keyword" placeholder="搜索客户" clearable style="width: 240px" @keyup.enter="load" />
      <el-button type="primary" @click="load">查询</el-button>
      <el-button type="success" @click="open()">新增客户</el-button>
    </div>
    <el-table :data="list" stripe>
      <el-table-column prop="code" label="编号" width="110" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="contact" label="联系人" width="120" />
      <el-table-column prop="phone" label="电话" width="140" />
      <el-table-column prop="level" label="等级" width="90">
        <template #default="{ row }">{{ row.level === 'wholesale' ? '批发' : '零售' }}</template>
      </el-table-column>
      <el-table-column prop="receivableBalance" label="应收款" width="120" />
      <el-table-column label="操作" width="140">
        <template #default="{ row }">
          <el-button link type="primary" @click="open(row)">编辑</el-button>
          <el-button link type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="visible" :title="form.id ? '编辑客户' : '新增客户'" width="520px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="编号"><el-input v-model="form.code" :disabled="!!form.id" /></el-form-item>
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="联系人"><el-input v-model="form.contact" /></el-form-item>
        <el-form-item label="电话"><el-input v-model="form.phone" /></el-form-item>
        <el-form-item label="地址"><el-input v-model="form.address" /></el-form-item>
        <el-form-item label="等级">
          <el-select v-model="form.level">
            <el-option label="零售" value="retail" />
            <el-option label="批发" value="wholesale" />
          </el-select>
        </el-form-item>
        <el-form-item label="期初应收"><el-input-number v-model="form.receivableBalance" :precision="2" /></el-form-item>
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
const form = reactive({ id: null, code: '', name: '', contact: '', phone: '', address: '', level: 'retail', receivableBalance: 0, remark: '' })

async function load() {
  const res = await http.get('/customers', { params: { keyword: keyword.value } })
  list.value = res.data
}
function open(row) {
  Object.assign(form, { id: null, code: '', name: '', contact: '', phone: '', address: '', level: 'retail', receivableBalance: 0, remark: '' }, row || {})
  visible.value = true
}
async function save() {
  if (form.id) await http.put(`/customers/${form.id}`, form)
  else await http.post('/customers', form)
  ElMessage.success('保存成功')
  visible.value = false
  load()
}
async function remove(row) {
  await ElMessageBox.confirm(`确认删除 ${row.name}？`, '提示')
  await http.delete(`/customers/${row.id}`)
  ElMessage.success('已删除')
  load()
}
onMounted(load)
</script>
<style scoped>
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
</style>
