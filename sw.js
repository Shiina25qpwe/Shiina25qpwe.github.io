/* ===========================================================
 * sw.js — Service Worker（PWA 离线缓存与请求拦截）
 * ===========================================================
 * Copyright 2016 @huxpro
 * Licensed under Apache 2.0
 *
 * 功能概述：
 *   1. 安装阶段（install）：预缓存 offline.html 离线页面
 *   2. 激活阶段（activate）：接管所有页面
 *   3. 请求拦截（fetch）：对白名单域名内的请求实施缓存策略
 *
 * 缓存策略：Stale-while-revalidate（优先返回缓存，同时后台更新）
 *   - 命中缓存 → 立即返回，同时发起网络请求更新缓存
 *   - 未命中缓存 → 等待网络请求，成功后存入缓存
 *   - 网络失败 → 返回 offline.html
 *
 * GitHub Pages 特殊处理：
 *   - 对无后缀的导航请求自动补 "/"（修复 GitHub Pages 自定义 404）
 *   - 添加 cache-bust 参数绕过 GitHub Pages 的 max-age=600
 *     https://bugs.chromium.org/p/chromium/issues/detail?id=453190
 *
 * 优化说明：
 *   - 修复 skipWaiting() 立即调用的 bug（原代码在事件注册时就调用了，而非缓存完成后）
 *   - 消除全局变量泄漏（url 未声明）
 *   - 为所有函数和关键逻辑添加中文注释
 * ========================================================== */

// ============================================================
// 缓存配置
// ============================================================

/** 预缓存名称（带版本号，更新 SW 时修改版本可清除旧缓存） */
const PRECACHE = 'precache-v1';

/** 运行时缓存名称（动态缓存，与预缓存分离便于管理） */
const RUNTIME = 'runtime';

/** 
 * 域名白名单 — 只有匹配的请求才会被 SW 拦截处理
 * 包括本站域名以及 CDN 等外部资源域名
 * 不在白名单内的请求（如 Google Analytics）直接放行
 */
const HOSTNAME_WHITELIST = [
    self.location.hostname,       // 本站域名（自动获取）
    "huangxuan.me",               // 自定义域名
    "yanshuo.io",                 // 友链域名
    "cdnjs.cloudflare.com"        // CDNJS（字体、JS 库等）
];


// ============================================================
// 工具函数
// ============================================================

/**
 * 修复请求 URL
 * 
 * 1. 协议统一：将 URL 协议与当前页面协议同步
 *    （避免 http→https 环境下的混合内容警告）
 * 2. 缓存破坏：添加 cache-bust 查询参数
 *    GitHub Pages 使用 Cache-Control: max-age=600，
 *    对可变资源可能导致缓存的旧内容被持续使用。
 *    在 Fetch API 的 cache mode 普及前，用查询字符串绕过。
 *
 * @param   {Request}  req - 被拦截的请求对象
 * @returns {string}        修复后的完整 URL（含 cache-bust 参数）
 */
const getFixedUrl = (req) => {
    var now = Date.now();                    // 当前时间戳，用作缓存破坏参数
    var url = new URL(req.url);              // 解析原始请求 URL

    // 1. 协议同步
    url.protocol = self.location.protocol;

    // 2. 添加 cache-bust 查询参数
    //    如果已有查询参数 → 追加 &cache-bust=...
    //    如果尚无查询参数 → 添加 ?cache-bust=...
    url.search += (url.search ? '&' : '?') + 'cache-bust=' + now;

    return url.href;
};

/**
 * 检测是否为页面导航请求
 *
 * Chrome 49 以下不支持 request.mode === 'navigate'，
 * 需要回退方案：检查 GET 请求且 Accept 头包含 text/html
 *
 * @param   {Request} req - 请求对象
 * @returns {boolean}      是否为导航请求
 */
const isNavigationReq = (req) => (
    req.mode === 'navigate' ||
    (req.method === 'GET' && req.headers.get('accept').includes('text/html'))
);

/**
 * 检测请求 URL 是否以文件扩展名结尾
 *
 * 根据 Fetch API 规范，导航请求的 mode="navigate" 和 destination="document"
 * 是区分页面的标准方式。但直接从地址栏请求图片等静态资源也有 mode="navigate"，
 * 因此仍需正则判断 URL 路径。
 *
 * 注：pathname 中没有 '.' 不代表无扩展名（如 /api/version/1.2/）
 *
 * @param   {Request} req - 请求对象
 * @returns {boolean}      是否以 .xxx 扩展名结尾
 */
const endWithExtension = (req) => (
    Boolean(new URL(req.url).pathname.match(/\.\w+$/))
);

/**
 * 检测是否需要重定向（GitHub Pages 路径修复）
 *
 * 问题：GitHub Pages 对无后缀、无结尾斜杠的路径返回 404
 * 解决：SW 检测导航请求的 pathname 不以 "/" 或扩展名结尾时，
 *       返回 302 重定向到 pathname + "/"
 *
 * 示例：
 *   /repo?blah → （GH 404）→ SW 302 → /repo/?blah ✓
 *   /file.js?blah → （不以 "/" 结尾但有扩展名）→ 不重定向 ✓
 *
 * 参考：https://twitter.com/Huxpro/status/798816417097224193
 *
 * @param   {Request} req - 请求对象
 * @returns {boolean}      是否需要重定向
 */
const shouldRedirect = (req) => (
    isNavigationReq(req) &&
    new URL(req.url).pathname.substr(-1) !== "/" &&
    !endWithExtension(req)
);

/**
 * 获取重定向目标 URL（pathname 末尾补 "/"）
 *
 * 注意：使用 URL 对象而非字符串拼接，避免在查询字符串末尾误加 "/"
 *
 * @param   {Request} req - 请求对象
 * @returns {string}        补 "/" 后的完整 URL
 */
const getRedirectUrl = (req) => {
    var url = new URL(req.url);
    url.pathname += "/";
    return url.href;
};


// ============================================================
// Service Worker 生命周期
// ============================================================

/**
 * 安装阶段（install）
 *
 * 触发时机：SW 首次注册或文件内容发生变化时
 * 流程：
 *   1. 打开预缓存空间
 *   2. 将 offline.html 加入缓存
 *   3. 成功后调用 skipWaiting() 跳过等待，立即激活
 *
 * e.waitUntil() : 延长 install 事件，直到传入的 Promise resolve
 *                 防止 SW 在缓存完成前就被激活
 * skipWaiting() : 跳过 waiting 状态，新 SW 立即接管页面
 *                 （已修复：原代码写成 self.skipWaiting()，在事件注册时
 *                  就立即调用了，而非等缓存完成后再调用）
 */
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(PRECACHE).then(function (cache) {
            return cache.add('offline.html')
                .then(function () {
                    return self.skipWaiting();  // 修复：仅在缓存成功后跳过等待
                })
                .catch(function (err) {
                    console.error('SW: precache failed', err);
                });
        })
    );
});

/**
 * 激活阶段（activate）
 *
 * 触发时机：skipWaiting() 后或旧 SW 不再被使用
 *
 * self.clients.claim() : 让新激活的 SW 立即接管所有已打开的页面
 *                        不加此调用则需刷新页面 SW 才会生效
 */
self.addEventListener('activate', function (event) {
    console.log('SW: activated');
    event.waitUntil(self.clients.claim());
});


// ============================================================
// 请求拦截（fetch）— Stale-while-revalidate 策略
// ============================================================

/**
 * 拦截所有网络请求，实施缓存策略
 *
 * 策略详情（Stale-while-revalidate）：
 *   1. 检查请求域名是否在白名单内（不在则放行）
 *   2. 同时发起缓存查询和网络请求
 *   3. 谁先返回就用谁（优先缓存速度，回退网络）
 *   4. 两者均失败 → 返回 offline.html
 *   5. 网络请求成功后 → 更新缓存（后台静默更新）
 *
 * 参考：
 *   - https://www.mnot.net/blog/2007/12/12/stale
 *   - https://gist.github.com/surma/eb441223daaedf880801ad80006389f1
 *
 * @param {FetchEvent} event - Fetch 事件对象
 *   event.request       : 被拦截的 Request 对象
 *   event.respondWith() : 用自定义 Response 响应请求
 *   event.waitUntil()   : 延长事件生命周期（用于后台缓存更新）
 */
self.addEventListener('fetch', function (event) {
    var requestUrl = new URL(event.request.url);

    // 调试日志（取消注释以排查问题）
    // console.log('SW fetch:', event.request.url);
    // console.log('  mode:', event.request.mode,
    //             'dest:', event.request.destination,
    //             'accept:', event.request.headers.get('accept'));

    // ---- 域名白名单检查：非白名单请求直接放行 ----
    if (HOSTNAME_WHITELIST.indexOf(requestUrl.hostname) === -1) {
        return;  // 不调用 respondWith()，浏览器按默认行为处理
    }

    // ---- GitHub Pages 路径修复：无后缀目录请求自动补 "/" ----
    if (shouldRedirect(event.request)) {
        event.respondWith(Response.redirect(getRedirectUrl(event.request)));
        return;
    }

    // ---- Stale-while-revalidate 缓存策略 ----
    // 同时获取缓存和网络响应
    var cached = caches.match(event.request);              // Promise<Response|undefined>
    var fixedUrl = getFixedUrl(event.request);             // 带 cache-bust 的 URL
    var fetched = fetch(fixedUrl, { cache: "no-store" });  // 绕过浏览器缓存，直连网络
    var fetchedCopy = fetched.then(function (resp) {        // 克隆一份用于后续缓存更新
        return resp.clone();
    });

    /**
     * respondWith：优先返回缓存，回退网络，兜底离线页
     *
     * Promise.race 逻辑：
     *   - fetched.catch(() => cached) : 网络失败时返回缓存（但缓存可能为 undefined）
     *   - cached 直接参与 race：若缓存已存在，大概率先于网络返回
     *   - .then(resp => resp || fetched) : 如果缓存未命中（undefined），等网络
     *   - .catch(() => caches.match('offline.html')) : 网络+缓存均失败，返回离线页
     */
    event.respondWith(
        Promise.race([
            fetched.catch(function () { return cached; }),
            cached
        ])
            .then(function (resp) {
                return resp || fetched;
            })
            .catch(function () {
                return caches.match('offline.html');
            })
    );

    /**
     * waitUntil：后台更新缓存
     *
     * 只有当网络响应状态为 ok（200-299）时才写入缓存，
     * 避免将错误响应（404、500 等）存入缓存污染后续请求。
     */
    event.waitUntil(
        Promise.all([fetchedCopy, caches.open(RUNTIME)])
            .then(function (results) {
                var response = results[0];
                var cache = results[1];
                if (response.ok) {
                    return cache.put(event.request, response);
                }
            })
            .catch(function () {
                // 缓存写入失败不影响页面响应（静默忽略）
            })
    );
});
