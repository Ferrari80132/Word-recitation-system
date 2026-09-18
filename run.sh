#!/bin/bash
# 单词背诵系统 - 一键启动脚本

echo "================================"
echo "  单词背诵系统 v1.0.2"
echo "================================"
echo ""

# 检查 Python 是否安装
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到 Python3，请先安装 Python3"
    exit 1
fi

# 检查虚拟环境是否存在
if [ ! -d "venv" ]; then
    echo "正在创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
echo "激活虚拟环境..."
source venv/bin/activate

# 安装依赖
echo "检查依赖..."
pip install -q -r requirements.txt

# 检查端口 5000 是否被占用
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "警告: 端口 5000 已被占用，正在尝试关闭旧进程..."
    kill -9 $(lsof -t -i:5000) 2>/dev/null
    sleep 1
fi

# 启动服务器（后台运行）
echo "正在启动服务器..."
python3 server.py > /dev/null 2>&1 &
SERVER_PID=$!

# 等待服务器启动
echo "等待服务器启动..."
sleep 2

# 检查服务器是否成功启动
if ! ps -p $SERVER_PID > /dev/null; then
    echo "错误: 服务器启动失败"
    exit 1
fi

echo "服务器已启动 (PID: $SERVER_PID)"
echo "访问地址: http://localhost:5000"
echo ""

# 自动打开浏览器
echo "正在打开浏览器..."
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5000
elif command -v gnome-open &> /dev/null; then
    gnome-open http://localhost:5000
elif command -v open &> /dev/null; then
    open http://localhost:5000
else
    echo "无法自动打开浏览器，请手动访问: http://localhost:5000"
fi

echo ""
echo "服务器正在运行中..."
echo "按 Ctrl+C 停止服务器"
echo ""

# 捕获 Ctrl+C 信号并清理进程
trap 'echo ""; echo "正在停止服务器..."; kill $SERVER_PID 2>/dev/null; exit 0' INT TERM

# 等待用户中断
wait $SERVER_PID
