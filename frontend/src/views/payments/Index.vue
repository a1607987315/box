<template>
  <el-card>
    <el-row :gutter="16" class="sum">
      <el-col :span="6"><el-statistic title="收款总额" :value="summary.receiveTotal" /></el-col>
      <el-col :span="6"><el-statistic title="付款总额" :value="summary.payTotal" /></el-col>
      <el-col :span="6"><el-statistic title="应收余额" :value="summary.receivable" /></el-col>
      <el-col :span="6"><el-statistic title="应付余额" :value="summary.payable" /></el-col>
    </el-row>
    <div class="toolbar">
      <el-button type="success" @click="openReceive">客户收款</el-button>
      <el-button type="warning" @click="openPay">供应商付款</el-button>
    </div>
    <el-table :data="list" stripe>
      <el-table-column prop="paymentNo" label="单号" width="200" />
      <el-table-column prop="type" label="类型" width="80">
        <template #default="{ row }">{{ row.type === 'receive' ? '收款' : '付款' }}</template>
      </el-table-column>
      <el-table-column prop="partnerName" label="往来单位" />
      <el-table-column prop="amount" label="金额" width="110" />
      <el-table-column prop="method" label="方式" width="110">
        <template #default="{ row }">{{ methodMap[row.method] }}</template>
      </el-table-column>
      <el-table-column prop="createdAt" label="时间" width="180" />
    </el-table>
    <el-dialog v-model="visible" :title="form.type === 'receive' ? '客户收款' : '供应商付款'" width="480px">
      <el-form :model="form" label-width="90px">
        <el-form-item :label="form.type === 'receive' ? '客户' : '供应商'">
          <el-select v-model="form.partnerId" filterable style="width: 100%">
            <el-option v-for="p in partners" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="金额"><el-input-number v-model="form.amount" :min="0.01" :precision="2" /></el-form-item>
        <el-form-item label="方式">
          <el-select v-model="form.method" style="width: 100%">
            <el-option label="现金" value="cash" />
            <el-option label="银行转账" value="bank_transfer" />
            <el-option label="微信" value="wechat" />
            <el-option label="支付宝" value="alipay" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联单据">
          <el-select v-model="form.refId" clearable filterable style="width: 100%" placeholder="可选">
            <el-option v-for="o in orders" :key="o.id" :label="o.orderNo" :value="o.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submit">确认</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import http from '../../api'

const list = ref([])
const summary = reactive({ receiveTotal: 0, payTotal: 0, receivable: 0, payable: 0 })
const visible = ref(false)
const partners = ref([])
const orders = ref([])
const form = reactive({ type: 'receive', partnerId: null, amount: 0, method: 'cash', refId: null, remark: '' })
const methodMap = { cash: '现金', bank_transfer: '银行转账', wechat: '微信', alipay: '支付宝', other: '其他' }

async function load() {
  list.value = (await http.get('/payments')).data
  Object.assign(summary, (await http.get('/payments/summary')).data)
}
async function openReceive() {
  form.type = 'receive'
  form.partnerId = null
  form.amount = 0
  form.refId = null
  partners.value = (await http.get('/customers')).data
  orders.value = (await http.get('/sales')).data
  visible.value = true
}
async function openPay() {
  form.type = 'pay'
  form.partnerId = null
  form.amount = 0
  form.refId = null
  partners.value = (await http.get('/suppliers')).data
  orders.value = (await http.get('/purchases')).data
  visible.value = true
}
async function submit() {
  if (form.type === 'receive') {
    await http.post('/payments/receive', { customerId: form.partnerId, amount: form.amount, method: form.method, refId: form.refId, remark: form.remark })
  } else {
    await http.post('/payments/pay', { supplierId: form.partnerId, amount: form.amount, method: form.method, refId: form.refId, remark: form.remark })
  }
  ElMessage.success('已保存')
  visible.value = false
  load()
}
onMounted(load)
</script>
<style scoped>
.sum { margin-bottom: 16px; }
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
</style>
