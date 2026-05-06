import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { join, extname } from "https://deno.land/std@0.224.0/path/mod.ts";

// Deno Deploy 运行时的工作目录
const BASE_DIR = Deno.cwd(); 

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

  // 2. 构建绝对路径
  const filePath = join(BASE_DIR, pathname);

  try {
    // 3. 读取文件内容 (Deno Deploy 中使用 Deno.readFile 更稳定)
    const fileData = await Deno.readFile(filePath);
    const ext = extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new Response(fileData, {
      status: 200,
      headers: {
        "Content-Type": contentType,
      },
    });

  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      // 如果是页面请求没找到，返回一个简单的 404 页面
      if (extname(pathname) === ".html") {
         return new Response("<h1>404 - Page Not Found</h1><p>The page you requested does not exist.</p><a href='/'>Go to Home</a>", { 
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

// 适配 Deno Deploy 启动方式 (不需要硬编码端口)
serve(handler);