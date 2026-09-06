<template>
  <div class="sheet" v-if="quote">
    <h2>报价单</h2>
    <div class="meta">
      <div>单号：{{ quote.quoteNo }}</div>
      <div>有效期：{{ quote.validUntil }}</div>
      <div>客户：{{ quote.Customer?.name }}</div>
      <div>联系人：{{ quote.Customer?.contact }} {{ quote.Customer?.phone }}</div>
    </div>
    <table>
      <thead>
        <tr><th>序号</th><th>商品</th><th>规格</th><th>单位</th><th>数量</th><th>单价</th><th>金额</th></tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in quote.items" :key="row.id">
          <td>{{ i + 1 }}</td>
          <td>{{ row.Product?.name }}</td>
          <td>{{ row.Product?.spec }}</td>
          <td>{{ row.Product?.salesUnit || row.Product?.baseUnit }}</td>
          <td>{{ row.quantity }}</td>
          <td>{{ row.unitPrice }}</td>
          <td>{{ row.amount }}</td>
        </tr>
      </tbody>
    </table>
    <div class="sum">合计 {{ quote.totalAmount }}　折扣率 {{ quote.discountRate }}%　报价金额 {{ quote.finalAmount }}</div>
    <p>备注：{{ quote.remark }}</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import http from '../../api'

const route = useRoute()
const quote = ref(null)
onMounted(async () => {
  quote.value = (await http.get(`/quotations/${route.params.id}`)).data
  setTimeout(() => window.print(), 400)
})
</script>
<style scoped>
.sheet { max-width: 800px; margin: 24px auto; color: #000; }
h2 { text-align: center; }
.meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 16px 0; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #333; padding: 6px; font-size: 13px; }
.sum { margin-top: 12px; font-weight: 700; }
</style>
