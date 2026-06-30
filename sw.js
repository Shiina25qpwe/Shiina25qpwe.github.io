/* ===========================================================
 * sw.js — Service Worker (PWA 离线缓存)
 * ===========================================================
 * 
 * Copyright 2016 @huxpro
 * Licensed under Apache 2.0
 *
 * ===========================================================
 * 功能概述
 * ===========================================================
 *
 * Service Worker 在浏览器后台运行, 拦截网络请求并提供缓存策略。
 *
 * 【三大生命周期事件】
 *   install  : 首次安装时预缓存关键资源 (offline.html)
 *   activate : 激活后接管页面控制权
 *   fetch    : 拦截所有网络请求, 执行缓存策略
 *
 * 【缓存策略: Stale-While-Revalidate (SWR)】
 *   1. 优先返回缓存 (立即响应, 速度快)
 *   2. 同时发起网络请求更新缓存 (后台静默刷新)
 *   3. 网络请求失败时返回缓存 (离线可用)
 *   4. 缓存也为空时返回 offline.html (离线提示页)
 *
 * 【缓存分类】
 *   PRECACHE (预缓存)  : install 时写入, 版本升级时更新
 *   RUNTIME  (运行时)  : 首次访问后动态缓存
 *
 * 【配合文件】
 *   pwa/manifest.json           : PWA 应用清单
 *   _config.yml service-worker  : 启用开关
 *   footer.html                 : 注册 SW 的 JS 代码
 *   offline.html                : 离线回退页面
 * ========================================================== */


// ==========================================================
//  常量配置
// ==========================================================

// 预缓存名称 (带版本号, 更新 SW 时改版本号即可清空旧缓存)
const PRECACHE = 'precache-v1';

// 运行时缓存名称 (动态缓存, 不需版本号)
const RUNTIME = 'runtime';

// 主机名白名单 — 仅拦截这些域名的请求
// ⚠ 仅保留本站和 CDN, 移除了原作者的个人域名 (huangxuan.me, yanshuo.io)
const HOSTNAME_WHITELIST = [
  self.location.hostname,        // 本站域名 (如 byq0002.github.io)
  "cdnjs.cloudflare.com"         // CDN (Font Awesome, FastClick 等)
];


// ==========================================================
//  工具函数
// ==========================================================

/**
 * getFixedUrl(req) — 修复请求 URL
 *
 * 两个修复:
 *   1. 协议同步: 将 http:// 改为与当前页面一致的协议 (避免混合内容警告)
 *   2. 缓存破坏: 添加 cache-bust 时间戳查询参数
 *      GitHub Pages 设置 Cache-Control: max-age=600 (10分钟),
 *      SW 可能在 10 分钟内返回过期内容。
 *      加时间戳强制每次请求都跳过 HTTP 缓存, 由 SW 自己管理缓存。
 *      参考: https://bugs.chromium.org/p/chromium/issues/detail?id=453190
 *
 * @param   {Request}  req - 原始请求对象
 * @returns {string}         - 修复后的 URL 字符串
 */
const getFixedUrl = (req) => {
  var now = Date.now();                        // 当前时间戳 (ms)
  const url = new URL(req.url);                // 解析 URL 对象

  // 1. 协议同步: 确保与页面协议一致
  url.protocol = self.location.protocol;

  // 2. 添加 cache-bust 参数: ?cache-bust=1234567890
  url.search += (url.search ? '&' : '?') + 'cache-bust=' + now;

  return url.href;
};


/**
 * isNavigationReq(req) — 判断是否为页面导航请求
 *
 * request.mode === 'navigate' 在 Chrome 49 以下不支持,
 * 所以增加降级判断: GET 请求 + Accept: text/html 头。
 *
 * @param   {Request} req
 * @returns {boolean}
 */
const isNavigationReq = (req) => (
  req.mode === 'navigate' ||
  (req.method === 'GET' && req.headers.get('accept').includes('text/html'))
);


/**
 * endWithExtension(req) — 判断 URL 是否以文件扩展名结尾
 *
 * 如 /style.css, /script.js, /image.png → true
 *    /about/, /tags/, /2024/01/post/ → false
 *
 * 根据 Fetch API 规范, 页面导航请求的 destination="document",
 * 静态资源请求的 destination 为 "image"/"style"/"script" 等。
 * 但浏览器支持不一致, 所以用正则匹配 .ext 作为辅助判断。
 *
 * @param   {Request} req
 * @returns {boolean}
 */
const endWithExtension = (req) => Boolean(
  new URL(req.url).pathname.match(/\.\w+$/)
);


/**
 * shouldRedirect(req) — 判断是否需要重定向
 *
 * GitHub Pages 对不带尾部斜杠的目录 URL 返回 404:
 *   /tags    → 404
 *   /tags/   → 正常
 *
 * 此函数检测: 是导航请求 + pathname 不以 / 结尾 + 不是文件 (.ext)
 * 符合条件时执行 302 重定向: /tags → /tags/
 *
 * 参考: https://twitter.com/Huxpro/status/798816417097224193
 *
 * @param   {Request} req
 * @returns {boolean}
 */
const shouldRedirect = (req) => (
  isNavigationReq(req) &&
  new URL(req.url).pathname.substr(-1) !== "/" &&
  !endWithExtension(req)
);


/**
 * getRedirectUrl(req) — 获取重定向目标 URL
 *
 * 在 pathname 末尾添加 "/"
 * 使用 URL 对象操作而非字符串拼接, 避免 query string 被破坏。
 *
 * @param   {Request} req
 * @returns {string}          - 重定向目标 URL
 */
const getRedirectUrl = (req) => {
  const url = new URL(req.url);
  url.pathname += "/";
  return url.href;
};


// ==========================================================
//  生命周期: Install
// ==========================================================
//
// 首次安装 / SW 版本更新时触发。
// 预缓存 offline.html 到 PRECACHE 缓存。
//
// e.waitUntil(promise) : 延迟 install 完成, 直到 promise resolve。
//   如果缓存写入失败, install 也失败, SW 不会激活。
//
// self.skipWaiting()   : 跳过等待状态, 立即激活新 SW。
//   (不等待旧 SW 释放所有页面)

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(PRECACHE).then(cache => {
      return cache.add('offline.html')
        .then(() => self.skipWaiting())        // 缓存写入完成后立即激活
        .catch(err => console.log('SW install error:', err));
    })
  );
});


// ==========================================================
//  生命周期: Activate
// ==========================================================
//
// 新 SW 激活时触发 (旧 SW 不再控制任何页面后)。
//
// self.clients.claim() : 让新 SW 立即接管所有页面 (不等待刷新)。
//   默认情况下 SW 只控制 install 后打开的页面。
//   claim() 让已打开的页面也被新 SW 控制。

self.addEventListener('activate', event => {
  console.log('Service Worker activated.');
  event.waitUntil(self.clients.claim());
});


// ==========================================================
//  生命周期: Fetch (核心)
// ==========================================================
//
// 拦截所有页面发起的网络请求。
// 仅处理白名单域名的请求, 跨域请求 (如 Google Analytics) 直接放行。
//
// 【缓存策略详解: Stale-While-Revalidate】
//
//   Promise.race([fetched.catch(_ => cached), cached])
//     ├─ fetched (网络请求) 失败 → 回退到 cached (缓存)
//     ├─ cached (缓存) 为空     → 等待 fetched (网络)
//     └─ 两者都失败               → 返回 offline.html (离线页)
//
//   并行策略:
//     - 有缓存时: 立即返回缓存 → 用户秒开
//     - 同时发起网络请求 → 后台更新缓存
//     - 下次访问时获得最新内容
//
//   参考:
//     - HTTP Stale-While-Revalidate: https://www.mnot.net/blog/2007/12/12/stale
//     - Surma's SWR: https://gist.github.com/surma/eb441223daaedf880801ad80006389f1

self.addEventListener('fetch', event => {

  // 调试日志 (生产环境可注释掉)
  console.log(`SW fetch: ${event.request.url}`);

  // 跨域请求放行 (白名单外的域名不处理)
  if (HOSTNAME_WHITELIST.indexOf(new URL(event.request.url).hostname) > -1) {

    // ── GitHub Pages 目录重定向修复 ──
    // /tags → 302 → /tags/
    if (shouldRedirect(event.request)) {
      event.respondWith(Response.redirect(getRedirectUrl(event.request)));
      return;  // 已处理, 不再执行后续缓存逻辑
    }

    // ── Stale-While-Revalidate ──

    // 1. 查找缓存中的匹配响应
    const cached = caches.match(event.request);

    // 2. 发起网络请求 (带 cache-bust 时间戳, 跳过 HTTP 缓存)
    const fixedUrl = getFixedUrl(event.request);
    const fetched = fetch(fixedUrl, { cache: "no-store" });
    const fetchedCopy = fetched.then(resp => resp.clone()); // 克隆一份用于缓存更新

    // 3. 响应策略: 优先返回最快的
    event.respondWith(
      Promise.race([
        fetched.catch(_ => cached),    // 网络失败 → 等缓存
        cached                         // 缓存就绪 → 直接返回
      ])
        .then(resp => resp || fetched)  // 缓存为空 → 等网络
        .catch(_ => caches.match('offline.html'))  // 都失败 → 离线页
    );

    // 4. 后台更新缓存 (不阻塞响应)
    //    仅缓存成功的响应 (response.ok = true, 即状态码 200-299)
    event.waitUntil(
      Promise.all([fetchedCopy, caches.open(RUNTIME)])
        .then(([response, cache]) =>
          response.ok && cache.put(event.request, response)
        )
        .catch(_ => { /* 静默处理缓存写入错误 */ })
    );
  }
});
