import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";
import { extname } from "https://deno.land/std@0.224.0/path/mod.ts";

// 使用 Deno 官方内置的 Deno.serve 启动服务，这是 Deno Deploy 最推荐的方式
Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const pathname = decodeURIComponent(url.pathname);

  // 支持无后缀访问，例如访问 /kzt 自动转为 /kzt.html
  if (pathname !== "/" && !extname(pathname)) {
    const newUrl = new URL(req.url);
    newUrl.pathname = pathname + ".html";
    // 构造一个新的请求对象传递给 serveDir
    req = new Request(newUrl.toString(), req);
  }

  // serveDir 会自动处理 MIME 类型、目录安全、缓存头等
  // fsRoot 设置为当前目录，在 Deno Deploy 中即为代码仓库根目录
  const response = await serveDir(req, {
    fsRoot: Deno.cwd(),
    showIndex: true,
  });

  // 如果没找到对应的 html，返回友好的 404
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