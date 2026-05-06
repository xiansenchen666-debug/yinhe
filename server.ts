import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";
import { extname } from "https://deno.land/std@0.224.0/path/mod.ts";

// Deno Deploy 推荐使用的标准入口方式 Deno.serve
Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const pathname = decodeURIComponent(url.pathname);

  // 支持无后缀访问，例如访问 /kzt 自动转为 /kzt.html
  if (pathname !== "/" && !extname(pathname)) {
    const newUrl = new URL(req.url);
    newUrl.pathname = pathname + ".html";
    req = new Request(newUrl.toString(), req);
  }

  // 使用 Deno 官方的文件服务器模块，自动处理 MIME 类型和静态文件托管
  const response = await serveDir(req, {
    fsRoot: Deno.cwd(), // 在 Deno Deploy 中自动指向当前项目根目录
    showIndex: true,    // 允许显示 index.html
  });

  // 处理 404
  if (response.status === 404 && req.url.endsWith(".html")) {
    return new Response(
      "<h1>404 - Page Not Found</h1><p>The page you requested does not exist.</p><a href='/'>Go to Home</a>",
      {
        status: 404,
        headers: { "Content-Type": "text/html; charset=UTF-8" },
      }
    );
  }

  return response;
});