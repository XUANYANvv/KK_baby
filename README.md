# 库柯baby职位检索器 (KK_baby)

> 用 AI 帮助你找到更适合你的好职位

一个基于 **纯前端 + SQLite 直连** 架构的职位数据检索工具。仿照 Ant Design Pro 风格构建,无需后端 API 层,数据库查询、解析、分页全部在浏览器端完成。

## 项目背景

本项目来源于对 `pending_queue.db`(爬虫待处理队列)中 `pending_jobs` 表的检索需求,旨在提供一个可视化的职位数据浏览与筛选界面。

### 数据概况

- 数据库文件:`pending_queue.db`(SQLite,约 36MB)
- 数据表:`pending_jobs`,共 **5857 条**职位记录
- 数据来源(8 个):

| 来源标识 | 中文名 | 职位数 |
|---------|--------|--------|
| xiaohongshu | 小红书 | 1308 |
| didi | 滴滴 | 1102 |
| mihoyo | 米哈游 | 905 |
| bilibili | 哔哩哔哩 | 877 |
| iflytek | 科大讯飞 | 822 |
| ctrip | 携程 | 531 |
| oppo | OPPO | 275 |
| pdd | 拼多多 | 37 |

## 功能特性

- **登录页**:网站品牌展示,点击登录直接进入(仅 UI,无后端校验)
- **欢迎页**:渲染展示项目 README(markdown → HTML)
- **职位检索页**:
  - 左侧按数据来源分组菜单,点击筛选对应来源数据
  - 分页显示,每页 20 条
  - 关键词搜索(职位名 / 公司 / 城市 / 来源)
  - 全部字段展示(核心列 + 行内展开详情 + 原始 payload)
  - 顶部统计栏(职位总数 / 来源数 / 公司数)随筛选动态更新

## 技术架构

```
┌─────────────────────────────────────────────────┐
│                    浏览器                         │
│  ┌──────────────────────────────────────────┐    │
│  │  sql.js (WebAssembly)                    │    │
│  │  · 解析 db 文件                           │    │
│  │  · 执行 SQL 查询 / 分页 / 过滤 / 搜索     │    │
│  └──────────────────────────────────────────┘    │
│              ▲ fetch('/db') 获取 ArrayBuffer      │
└──────────────┼────────────────────────────────────┘
               │
┌──────────────┴────────────────────────────────────┐
│         server.js (Node 内置 http, ~100 行)        │
│  · 提供静态页面                                    │
│  · /db 接口返回 pending_queue.db 文件              │
└───────────────────────────────────────────────────┘
```

### 核心依赖

- **sql.js**(`public/vendor/`):SQLite 编译为 WebAssembly,浏览器端运行
- **marked**(`public/vendor/`):Markdown 渲染
- 以上库均已本地化,不依赖外部 CDN

## 目录结构

```
backend/
├── server.js              # Node 静态服务器 + /db 文件接口
├── README.md              # 项目说明(本文件)
└── public/
    ├── login.html         # 登录页
    ├── welcome.html       # 欢迎页(README 展示)
    ├── jobs.html          # 职位检索表格页(核心)
    ├── common.css         # 三页共用的 antd 风格样式
    ├── README.md          # 欢迎页展示的 markdown 源文件
    ├── README.zh-CN.md
    └── vendor/
        ├── sql-wasm.js    # sql.js 库
        ├── sql-wasm.wasm  # sql.js WASM 二进制
        └── marked.min.js  # marked 库
```

## 快速开始

### 环境要求

- Node.js ≥ 20(内置 `node:http`,无需额外 npm 依赖)

### 启动

```bash
cd backend
node server.js
```

启动后访问:

| 页面 | 地址 |
|------|------|
| 登录页 | http://localhost:3000/login.html |
| 欢迎页 | http://localhost:3000/welcome.html |
| 职位检索页 | http://localhost:3000/jobs.html |

### 配置数据库路径

默认读取 `C:\Users\15578\WorkBuddy\work\crawler\state\pending_queue.db`,可通过环境变量覆盖:

```bash
# Windows (PowerShell)
$env:DB_PATH = "D:\your\path\pending_queue.db"
node server.js

# Linux / macOS
DB_PATH=/path/to/pending_queue.db node server.js
```

### 修改端口

```bash
# 默认 3000,可通过 PORT 环境变量修改
PORT=8080 node server.js
```

## 关键技术决策

1. **纯前端 + SQLite 直连**:浏览器通过 `/db` 接口获取 db 文件后,由 sql.js 在浏览器端完成所有查询逻辑,服务端不做业务处理。这避免了后端 API 层,架构极简。
2. **本地化依赖**:sql.js 与 marked 均下载到 `public/vendor/`,不依赖外部 CDN,避免国内网络访问 jsdelivr 不稳定的问题。
3. **全部字段展示**:`pending_jobs` 表的 `payload` 字段为 JSON,前端将其解析并与表字段合并展示,嵌套对象(如 `raw_data`)放入行内展开区。

## License

MIT
