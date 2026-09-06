# 供销存管理系统

中小型进销存软件：商品、供应商、客户、仓库、采购、报价、销售、库存、收付款。支持多单位换算、运费折扣、历史价格、订单打印。Docker 一键部署。

## 本地开发

```bash
# 后端
cd backend
npm install
node src/app.js

# 前端（另开终端）
cd frontend
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`。前端已把 `/api` 代理到后端 `3000`。

首次启动会自动建表。可选种子数据：

```bash
cd backend
node src/utils/seed.js
```

## 服务器 Docker 部署

```bash
git clone https://github.com/a1607987315/box.git
cd box
docker compose up -d --build
```

访问服务器 `http://IP`。SQLite 数据在 Docker Volume `erp-data`，重启不丢。

常用命令：

```bash
docker compose logs -f
docker compose down
docker compose up -d --build
```

## 功能

- 商品：成本价 / 批发价 / 销售价，采购单位与销售单位换算（例如公斤进、米出）
- 采购入库：加权平均成本、供应商应付、库存流水
- 报价单：有效期、折扣、一键转销售订单、打印
- 销售订单：历史成交价、运费、折扣率/折扣金额、出库、打印
- 财务：客户收款、供应商付款、应收应付汇总
- 库存：多仓、调拨、盘点、流水

后期可再加多用户权限和 APK 客户端（后端已是 REST API）。
