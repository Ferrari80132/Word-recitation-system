#!/bin/bash
# 启动单词背诵系统服务器

# 激活虚拟环境
source venv/bin/activate

# 安装依赖（如果还没安装）
pip install -q -r requirements.txt

# 启动服务器
python3 server.py
