#!/bin/bash
# 停止单词背诵系统服务器

echo "正在查找运行中的服务器进程..."

# 查找 Flask 服务器进程
PID=$(ps aux | grep '[p]ython.*server.py' | awk '{print $2}')

if [ -z "$PID" ]; then
    echo "未找到运行中的服务器"
else
    echo "找到服务器进程 (PID: $PID)"
    echo "正在停止服务器..."
    kill $PID
    sleep 1

    # 检查是否成功停止
    if ps -p $PID > /dev/null 2>&1; then
        echo "强制停止服务器..."
        kill -9 $PID
    fi

    echo "服务器已停止"
fi
