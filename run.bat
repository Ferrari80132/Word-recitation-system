@echo off
REM 单词背诵系统 - 一键启动脚本 (Windows)

echo ================================
echo   单词背诵系统 v1.0.2
echo ================================
echo.

REM 检查 Python 是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到 Python，请先安装 Python3
    pause
    exit /b 1
)

REM 检查虚拟环境是否存在
if not exist "venv" (
    echo 正在创建虚拟环境...
    python -m venv venv
)

REM 激活虚拟环境
echo 激活虚拟环境...
call venv\Scripts\activate.bat

REM 安装依赖
echo 检查依赖...
pip install -q -r requirements.txt

REM 检查端口是否被占用
netstat -ano | findstr :5000 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo 警告: 端口 5000 已被占用，请手动关闭占用该端口的程序
    echo 或者修改 server.py 中的端口号
    pause
)

REM 启动服务器（后台运行）
echo 正在启动服务器...
start /B python server.py

REM 等待服务器启动
echo 等待服务器启动...
timeout /t 3 /nobreak >nul

echo 服务器已启动
echo 访问地址: http://localhost:5000
echo.

REM 自动打开浏览器
echo 正在打开浏览器...
start http://localhost:5000

echo.
echo 服务器正在运行中...
echo 按 Ctrl+C 停止服务器
echo.

REM 直接运行 Python 服务器（前台运行，Ctrl+C 会自动停止）
python server.py
