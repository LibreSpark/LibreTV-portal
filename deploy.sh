#!/bin/bash

# LibreTV Portal Deployment Script

echo "🚀 LibreTV Portal 部署脚本"
echo "=========================="

# 检查是否安装了必要的工具
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 未安装，请先安装 $1"
        exit 1
    else
        echo "✅ $1 已安装"
    fi
}

# 检查必要工具
echo "📋 检查必要工具..."
check_tool "git"
check_tool "npm"

# 安装依赖
echo "📦 安装依赖..."
npm install

# 验证文件结构
echo "🔍 验证文件结构..."
required_files=("index.html" "styles/main.css" "scripts/main.js" "vercel.json" "package.json")

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file 存在"
    else
        echo "❌ $file 不存在"
        exit 1
    fi
done

# 运行本地服务器进行测试
echo "🧪 启动本地测试服务器..."
echo "📍 请访问: http://localhost:3000"
echo "⏹️  按 Ctrl+C 停止服务器"
echo ""

npm run dev
