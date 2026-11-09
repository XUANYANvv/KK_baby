/**
 * 库柯baby职位检索器 - 极简静态服务器
 *
 * 职责：
 * 1. 提供静态页面（登录页 / 欢迎页 / 查询表格页）
 * 2. 提供 pending_queue.db 文件下载接口（/db），供浏览器端 sql.js 解析
 *
 * 说明：本项目采用「纯前端 + SQLite 直连」方案，数据库的解析、查询、分页
 * 全部在浏览器端由 sql.js（WebAssembly）完成，本服务器不做任何业务逻辑。
 */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// 本地数据库文件路径（可通过环境变量覆盖）
const DB_PATH =
  process.env.DB_PATH ||
  'C:\\Users\\15578\\WorkBuddy\\work\\crawler\\state\\pending_queue.db';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.db': 'application/octet-stream',
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(url.pathname);

  // 数据库文件下载接口
  if (pathname === '/db') {
    fs.readFile(DB_PATH, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(
          JSON.stringify({
            error: '无法读取数据库文件',
            path: DB_PATH,
            detail: err.message,
          }),
        );
        return;
      }
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Length': data.length,
        'Content-Disposition': 'inline; filename="pending_queue.db"',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(data);
    });
    return;
  }

  // 首页重定向到登录页
  if (pathname === '/') {
    pathname = '/login.html';
  }

  // 静态文件服务
  const filePath = path.join(PUBLIC_DIR, pathname);
  // 防止路径穿越
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  库柯baby职位检索器 已启动');
  console.log(`  ➜  本地访问: http://localhost:${PORT}`);
  console.log(`  ➜  数据库:   ${DB_PATH}`);
  console.log('');
});
