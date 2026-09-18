@echo off
REM 启动单词背诵系统服务器 (Windows)

echo 正在启动单词背诵系统...

REM 激活虚拟环境
call venv\Scripts\activate.bat

REM 安装依赖（如果还没安装）
pip install -q -r requirements.txt

REM 启动服务器
python server.py

pause
