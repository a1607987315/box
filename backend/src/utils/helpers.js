function generateOrderNo(prefix) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const r = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `${prefix}${y}${m}${d}${h}${min}${s}${r}`;
}

function round2(val) {
  return Math.round(Number(val) * 100) / 100;
}

function calcDiscountAmount(totalAmount, discountType, discountValue) {
  if (discountType === 'rate') {
    return round2(totalAmount * (Number(discountValue) / 100));
  }
  if (discountType === 'amount') {
    return round2(Number(discountValue) || 0);
  }
  return 0;
}

module.exports = { generateOrderNo, round2, calcDiscountAmount };
