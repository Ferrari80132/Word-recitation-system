@echo off
REM 停止单词背诵系统服务器

echo 正在查找运行中的服务器进程...

REM 查找并停止所有 Python server.py 进程
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo 找到服务器进程 (PID: %%a)
    echo 正在停止服务器...
    taskkill /F /PID %%a >nul 2>&1
    echo 服务器已停止
    goto :done
)

echo 未找到运行中的服务器

:done
pause
