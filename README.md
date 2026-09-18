# 单词背诵系统

一个功能完整的本地单词背诵网页应用，支持六级和考研词汇学习。

## 功能特点

- ✅ **浅色/暗色主题切换** - 自动保存主题偏好
- ✅ **多词书支持** - 六级词汇和考研词汇，可随时切换
- ✅ **三模块学习系统**
  - 学习模块：新单词学习
  - 复习模块：基于艾宾浩斯遗忘曲线的智能复习
  - 已学完模块：查看已掌握的单词
- ✅ **自定义学习设置** - 可设置每组学习的单词数量（5-50个）
- ✅ **三轮学习法**
  - 第一轮：看英文选中文（4选1）
  - 第二轮：看中文选英文（4选1）
  - 第三轮：看中文拼写英文
- ✅ **智能分类** - 根据答题情况自动分类单词为"已掌握"或"需复习"
- ✅ **按频率排序** - 单词按考试出现频率由高到低排序
- ✅ **进度可视化** - 实时显示每个模块的完成情况
- ✅ **每日统计** - 图表展示最近7天的学习和复习数据
- ✅ **签到系统** - 每日签到功能和签到日历
- ✅ **本地文件存储** - 所有学习进度保存到本地文件，支持备份

## 使用方法

### 环境要求

- Python 3.7+
- 现代浏览器（Chrome 90+, Firefox 88+, Safari 14+, Edge 90+）

### 快速启动（推荐）

#### Linux / macOS
```bash
./run.sh
```

#### Windows
双击 `run.bat` 或在命令行中运行：
```cmd
run.bat
```

脚本会自动：
- 创建 Python 虚拟环境
- 安装依赖包
- 启动服务器
- 打开浏览器

**停止服务器：**
- Linux/Mac: `./stop.sh`
- Windows: `stop.bat`
- 或者在运行服务器的终端窗口按 `Ctrl+C`

### 手动启动

#### 在 Ubuntu/Linux 上部署

1. **克隆或下载项目到本地**
   ```bash
   cd ~/下载/Word-recitation-system
   ```

2. **创建虚拟环境（可选但推荐）**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **安装 Python 依赖**
   ```bash
   pip3 install -r requirements.txt
   ```

4. **启动后端服务**
   ```bash
   python3 server.py
   ```

   服务器启动后会显示：
   ```
   单词背诵系统服务器启动中...
   数据存储目录: /home/用户名/下载/Word-recitation-system/data
   访问地址: http://localhost:5000
   ```

5. **打开浏览器访问**
   ```
   http://localhost:5000
   ```

#### 在 Windows 上部署

1. **打开命令提示符或 PowerShell**
   ```cmd
   cd C:\path\to\Word-recitation-system
   ```

2. **创建虚拟环境（可选但推荐）**
   ```cmd
   python -m venv venv
   venv\Scripts\activate
   ```

3. **安装依赖**
   ```cmd
   pip install -r requirements.txt
   ```

4. **启动服务**
   ```cmd
   python server.py
   ```

5. **浏览器访问**
   ```
   http://localhost:5000
   ```

## 学习流程

### 1. 首次使用
- 选择词书（六级/考研）
- 点击设置按钮，设置每组学习单词数
- 点击"今日签到"按钮签到

### 2. 开始学习
- 点击"学习"模块的"开始学习"按钮
- 完成三轮测试：
  - **第一轮**：看英文单词，从4个中文释义中选择正确答案
  - **第二轮**：看中文释义，从4个英文单词中选择正确答案
  - **第三轮**：看中文释义，拼写出完整的英文单词
- 三轮全对的单词将进入"已学完"模块
- 有错误的单词将进入"复习"模块

### 3. 智能复习
- 复习模块中的单词会按照艾宾浩斯遗忘曲线自动安排复习时间
- 复习间隔：1天 → 2天 → 4天 → 7天 → 15天 → 30天
- 点击"复习"模块查看需要复习的单词
- 复习流程与学习相同（三轮测试）

### 4. 查看进度
- 主界面显示每个模块的完成情况
- 图表展示最近7天的学习和复习统计
- 签到日历显示签到记录和连续签到天数

## 技术特点

- **前后端分离** - Flask 后端 + 原生 JavaScript 前端
- **本地文件存储** - 数据保存在 `data/user_data.json` 文件中
- **RESTful API** - 标准的 API 接口设计
- **响应式设计** - 支持各种屏幕尺寸
- **现代化UI** - 使用 CSS 变量和过渡动画
- **数据可视化** - 使用 Chart.js 绘制统计图表

## 数据存储

所有学习数据保存在项目的 `data` 目录下：
- `data/user_data.json` - 当前用户数据
- `data/backup_*.json` - 自动备份文件（可选）

保存的数据包括：
- 学习进度
- 复习计划
- 已掌握单词
- 签到记录
- 每日统计

## API 接口

### 获取用户数据
```
GET /api/data
返回: { "success": true, "data": {...} }
```

### 保存用户数据
```
POST /api/data
请求体: { "currentBook": "cet6", "masteredWords": [...], ... }
返回: { "success": true, "message": "数据保存成功" }
```

### 备份数据
```
GET /api/backup
返回: { "success": true, "message": "备份成功: backup_20260918_123456.json" }
```

## 词汇数据

- **六级词汇**：约95个高频词汇
- **考研词汇**：约100个高频词汇
- 每个单词包含：英文、中文释义、考试频率
- 单词按频率从高到低排序（非字母顺序）

## 自定义词汇

如需添加更多单词，编辑 `vocabulary.js` 文件：

```javascript
const CET6_VOCABULARY = [
    { word: "example", meaning: "例子；实例", frequency: 100 },
    // 添加更多单词...
];
```

## 故障排除

### 服务器无法停止
如果按 `Ctrl+C` 后服务器仍在后台运行：
- Linux/Mac: 运行 `./stop.sh`
- Windows: 运行 `stop.bat`
- 或手动查找进程：
  ```bash
  # Linux/Mac
  ps aux | grep server.py
  kill <PID>
  
  # Windows
  netstat -ano | findstr :5000
  taskkill /F /PID <PID>
  ```

### 无法启动服务器
- 确保已安装 Python 3.7+
- 检查依赖是否已安装：`pip3 list | grep -i flask`
- 检查端口 5000 是否被占用，尝试更换端口：修改 `server.py` 中的端口号

### 页面显示"无法连接到服务器"
- 确保后端服务正在运行
- 检查浏览器控制台的错误信息
- 确认访问地址为 `http://localhost:5000`

### 数据无法保存
- 检查 `data` 目录是否有写入权限
- 查看服务器终端的错误日志
- 尝试手动创建 `data` 目录

### 图表不显示
- 确保 Chart.js CDN 可访问
- 检查网络连接
- 尝试刷新页面

## 数据备份

建议定期备份 `data` 目录：

```bash
# 手动备份
cp -r data data_backup_$(date +%Y%m%d)

# 或通过 API 备份
curl http://localhost:5000/api/backup
```

## 许可证

此项目采用 GNU General Public License v3.0 开源协议。

## 更新日志

### v1.0.2 (2026-09-18)
- 🎉 **重大更新：数据存储方式改变**
- ✨ 将数据存储从浏览器 localStorage 迁移到本地文件
- ✨ 添加 Flask 后端服务器支持
- ✨ 实现 RESTful API 接口（GET/POST /api/data, GET /api/backup）
- ✨ 添加数据备份功能
- ✨ 添加一键启动脚本（run.sh 和 run.bat）
- ✨ 改进错误处理，即使服务器未连接也能正常使用
- ✨ 数据持久化更可靠，不再受浏览器清理影响
- 🐛 修复异步加载导致页面卡死的问题
- 📝 更新部署文档，添加详细的安装和使用说明

### v1.0.0 (2024)
- 初始版本
- 支持六级和考研词汇
- 实现三轮学习法
- 艾宾浩斯复习系统
- 签到和统计功能

