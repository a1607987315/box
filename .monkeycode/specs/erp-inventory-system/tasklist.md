# 供销存管理系统 - 实施任务列表

## Phase 1: 项目初始化与基础设施

- [x] 1.1 生成需求文档 requirements.md
- [x] 1.2 生成技术设计文档 design.md
- [ ] 1.3 初始化后端项目结构和依赖（Express + Sequelize + SQLite）
- [ ] 1.4 初始化前端项目结构和依赖（Vue3 + Vite + Element Plus）
- [ ] 1.5 配置 Docker 和 Docker Compose（Nginx + Node + Volume）
- [ ] 1.6 配置 Nginx 反向代理

## Phase 2: 后端数据模型

- [ ] 2.1 定义 Sequelize 数据模型（Product, Supplier, Customer, Warehouse）
- [ ] 2.2 定义 Sequelize 数据模型（Inventory, InventoryTransaction）
- [ ] 2.3 定义 Sequelize 数据模型（PurchaseOrder, PurchaseOrderItem）
- [ ] 2.4 定义 Sequelize 数据模型（SalesOrder, SalesOrderItem）
- [ ] 2.5 定义 Sequelize 数据模型（Quotation, QuotationItem）
- [ ] 2.6 定义 Sequelize 数据模型（Payment, PriceHistory）
- [ ] 2.7 模型关联关系和数据库初始化脚本
- [ ] 2.8 初始数据种子（示例商品、客户、供应商、仓库）

## Phase 3: 后端API开发

- [ ] 3.1 商品管理 CRUD API
- [ ] 3.2 供应商管理 CRUD API
- [ ] 3.3 客户管理 CRUD API
- [ ] 3.4 仓库管理 API（含调拨）
- [ ] 3.5 采购单 API（创建、编辑、确认入库联动）
- [ ] 3.6 销售订单 API（创建、编辑、确认出库联动、历史价格）
- [ ] 3.7 报价单 API（创建、编辑、转订单、打印数据）
- [ ] 3.8 库存管理 API（库存查询、流水查询、盘点调整）
- [ ] 3.9 财务收付款 API
- [ ] 3.10 仪表盘统计 API
- [ ] 3.11 历史价格查询 API
- [ ] 3.12 销售订单和报价单打印数据 API

## Phase 4: 前端开发

- [ ] 4.1 前端项目框架搭建（路由、Pinia、Axios封装、布局）
- [ ] 4.2 侧边栏导航和主布局
- [ ] 4.3 首页仪表盘
- [ ] 4.4 商品管理页面（列表、新增、编辑）
- [ ] 4.5 供应商管理页面
- [ ] 4.6 客户管理页面
- [ ] 4.7 仓库管理页面（含调拨功能）
- [ ] 4.8 采购单页面（列表、新建、详情、入库确认）
- [ ] 4.9 销售订单页面（列表、新建含运费/折扣、详情、出库确认、历史价格引用）
- [ ] 4.10 报价单页面（列表、新建、详情、转订单）
- [ ] 4.11 库存查询和流水页面
- [ ] 4.12 财务收付款页面
- [ ] 4.13 销售订单和报价单打印页面

## Phase 5: Docker部署与验证

- [ ] 5.1 编写后端 Dockerfile
- [ ] 5.2 编写前端 Dockerfile（多阶段构建）
- [ ] 5.3 编写 docker-compose.yml
- [ ] 5.4 本地构建测试，确保服务正常启动
- [ ] 5.5 编写 README 部署说明

## Phase 6: 提交发布

- [ ] 6.1 初始化 Git 仓库，编写 .gitignore
- [ ] 6.2 提交所有代码
- [ ] 6.3 推送到 GitHub
