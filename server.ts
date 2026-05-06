import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { join, extname } from "https://deno.land/std@0.224.0/path/mod.ts";

const PORT = 8000;
const BASE_DIR = Deno.cwd(); // 当前运行目录

// MIME 类型映射，确保浏览器能正确解析各类静态文件
const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=UTF-8",
  ".css": "text/css; charset=UTF-8",
  ".js": "application/javascript; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  let pathname = decodeURIComponent(url.pathname);

  // 1. 路由映射：默认将根路径映射到 index.html
  if (pathname === "/") {
    pathname = "/index.html";
  } 
  // 为了支持无后缀访问 (例如访问 /kzt 自动读取 kzt.html)
  else if (!extname(pathname)) {
    pathname = pathname + ".html";
  }

  // 2. 构建绝对路径，防止目录遍历攻击 (Directory Traversal)
  // 使用 join 并在后续检查前缀可以一定程度上防止跨出 BASE_DIR
  let filePath = join(BASE_DIR, pathname);
  
  // 简单安全检查：确保请求的文件在当前工作目录内
  if (!filePath.startsWith(BASE_DIR)) {
     return new Response("Forbidden", { status: 403 });
  }

  try {
    // 3. 尝试读取文件信息，如果不存在会抛出异常进入 catch 块
    const fileInfo = await Deno.stat(filePath);
    
    if (fileInfo.isDirectory) {
      // 如果访问的是个目录（通常已经被重定向到了 /index.html），则报 403
      return new Response("Forbidden", { status: 403 });
    }

    // 4. 打开文件并设置正确的 Content-Type 响应给客户端
    const file = await Deno.open(filePath);
    const ext = extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new Response(file.readable, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-cache" // 开发阶段禁用缓存，方便调试
      },
    });

  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      // 如果是页面请求没找到，返回一个简单的 404 页面
      if (extname(pathname) === ".html") {
         return new Response("<h1>404 - 页面未找到</h1><p>您访问的页面不存在，请检查 URL。</p><a href='/'>返回首页</a>", { 
           status: 404,
           headers: { "Content-Type": "text/html; charset=UTF-8" }
         });
      }
      return new Response("File Not Found", { status: 404 });
    }
    // 其他服务器错误
    console.error(`Error serving ${filePath}:`, err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

console.log(`🚀 银河量化前端服务器已启动！`);
console.log(`👉 请在浏览器中访问: http://localhost:${PORT}/`);

serve(handler, { port: PORT });