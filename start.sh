#!/bin/bash
set -e
cd "$(dirname "$0")"

# 启动后端 API
cd backend
if [ ! -d node_modules ]; then
  npm install
fi
node src/app.js &
BACKEND_PID=$!
cd ..

# 启动前端（对外预览端口）
cd frontend
if [ ! -d node_modules ]; then
  npm install
fi
npm run dev
