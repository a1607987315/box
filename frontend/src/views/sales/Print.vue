<template>
  <div class="sheet" v-if="order">
    <h2>销售单 / 报价单</h2>
    <table class="meta">
      <tr>
        <td>单号</td><td>{{ order.orderNo }}</td>
        <td>日期</td><td>{{ (order.createdAt || '').slice(0, 10) }}</td>
      </tr>
      <tr>
        <td>客户</td><td>{{ order.Customer?.name }}</td>
        <td>联系人</td><td>{{ order.Customer?.contact }} {{ order.Customer?.phone }}</td>
      </tr>
      <tr>
        <td>仓库</td><td>{{ order.Warehouse?.name }}</td>
        <td>备注</td><td>{{ order.remark || '-' }}</td>
      </tr>
    </table>
    <table class="items">
      <thead>
        <tr>
          <th class="c" width="50">序号</th>
          <th width="110">SKU编号</th>
          <th>商品名称</th>
          <th width="90">规格</th>
          <th class="c" width="60">单位</th>
          <th class="r" width="80">数量</th>
          <th class="r" width="90">单价</th>
          <th class="r" width="100">金额</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in order.items" :key="row.id">
          <td class="c">{{ i + 1 }}</td>
          <td>{{ row.Product?.code }}</td>
          <td>{{ row.Product?.name }}</td>
          <td>{{ row.Product?.spec }}</td>
          <td class="c">{{ row.Product?.salesUnit || row.Product?.baseUnit }}</td>
          <td class="r">{{ formatQty(row.quantity) }}</td>
          <td class="r">{{ formatMoney(row.unitPrice) }}</td>
          <td class="r">{{ formatMoney(row.amount) }}</td>
        </tr>
        <tr class="sum">
          <td colspan="7" class="r">商品合计</td>
          <td class="r">{{ formatMoney(order.totalAmount) }}</td>
        </tr>
        <tr class="sum">
          <td colspan="7" class="r">运费</td>
          <td class="r">{{ formatMoney(order.freight) }}</td>
        </tr>
        <tr class="sum">
          <td colspan="7" class="r">折扣</td>
          <td class="r">{{ formatMoney(order.discountAmount) }}</td>
        </tr>
        <tr class="sum total">
          <td colspan="7" class="r">应收金额</td>
          <td class="r">{{ formatMoney(order.receivableAmount) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import http from '../../api'

const route = useRoute()
const order = ref(null)

function formatMoney(v) {
  return Number(v || 0).toFixed(2)
}
function formatQty(v) {
  return Number(v || 0)
}

onMounted(async () => {
  order.value = (await http.get(`/sales/${route.params.id}`)).data
  setTimeout(() => window.print(), 400)
})
</script>

<style>
@media print {
  body { background: #fff; margin: 0; }
}
</style>
<style scoped>
.sheet { max-width: 900px; margin: 16px auto; color: #000; font-size: 13px; }
h2 { text-align: center; margin: 0 0 12px; }
table { width: 100%; border-collapse: collapse; }
.meta { margin-bottom: 10px; }
.meta td { border: 1px solid #333; padding: 6px 8px; }
.meta td:nth-child(odd) { width: 70px; background: #f3f3f3; font-weight: 600; }
.items th, .items td { border: 1px solid #333; padding: 6px 8px; }
.items th { background: #f3f3f3; }
.c { text-align: center; }
.r { text-align: right; }
.sum td { font-weight: 600; }
.total td { font-size: 14px; }
</style>
