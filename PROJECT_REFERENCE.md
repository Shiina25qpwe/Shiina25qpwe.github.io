# Hux Blog 项目参考手册

> 本文档为 `Shiina25qpwe.github.io` 项目各文件的**字段速查、参数说明、引用关系**汇总。
> 方便修改配置时快速定位：改什么 → 找哪个文件 → 调整哪个值。

---

## 目录

- [项目文件地图](#项目文件地图)
- [_config.yml 配置速查](#_configyml-配置速查)
- [社交图标配置](#社交图标配置)
- [评论系统配置 (Gitalk / Disqus)](#评论系统配置-gitalk--disqus)
- [统计分析配置 (GA / 百度)](#统计分析配置-ga--百度)
- [Jekyll 模板速查](#jekyll-模板速查)
- [RSS / Feed 配置](#rss--feed-配置)
- [PWA 配置](#pwa-配置)
- [CSS / Less 构建](#css--less-构建)
- [npm / Grunt 命令](#npm--grunt-命令)
- [CI / CD 配置](#ci--cd-配置)

---

## 项目文件地图

```
Shiina25qpwe.github.io/
├── _config.yml          ← 全局配置 (所有变量集中于此)
├── index.html           ← 首页文章列表
├── 404.html             ← 页面未找到错误页
├── offline.html         ← PWA 离线提示页
├── about.html           ← 关于页面
├── feed.xml             ← RSS 订阅源
│
├── _layouts/            ← 页面布局模板
│   ├── default.html     ← 根布局 (所有页面继承)
│   ├── page.html        ← 通用页面 (首页/标签/关于)
│   ├── post.html        ← 文章详情页
│   └── keynote.html     ← 演示文稿页
│
├── _includes/           ← 可复用组件
│   ├── head.html        ← <head> 标签 (meta/SEO/CSS)
│   ├── nav.html         ← 顶部导航栏
│   ├── footer.html      ← 页脚 (社交图标/JS/统计)
│   └── social-icon.html ← 社交图标组件
│
├── css/                 ← 样式表
│   ├── hux-blog.css     ← 主题样式 (由 Less 编译)
│   ├── hux-blog.min.css ← 压缩版
│   ├── syntax.css       ← 代码高亮主题 (Rouge)
│   └── bootstrap.*.css  ← Bootstrap v3 (不修改)
│
├── js/                  ← JavaScript
│   ├── hux-blog.js      ← 主题脚本
│   ├── jquery.nav.js    ← 滚动目录插件 (OnePageNav)
│   ├── jquery.tagcloud.js ← 标签云插件
│   └── bootstrap/jquery/md5 *.js ← 第三方库 (不修改)
│
├── less/                ← Less 源文件 (编译 → css/)
│   ├── hux-blog.less    ← 主样式源
│   ├── variables.less   ← 颜色变量
│   ├── mixins.less      ← 可复用 Mixin
│   ├── sidebar.less     ← 侧边栏样式
│   └── side-catalog.less ← 侧边目录样式
│
├── pwa/                 ← PWA 配置
│   ├── manifest.json    ← Web App Manifest
│   └── icons/           ← PWA 图标 (128px + 512px)
│
├── Gruntfile.js         ← Grunt 构建配置
├── package.json         ← npm 项目配置
├── .travis.yml          ← Travis CI 配置
├── codecov.yml          ← Codecov 覆盖率配置
└── PROJECT_REFERENCE.md ← 本文件
```

---

## _config.yml 配置速查

### 站点基本信息

| 变量 | 类型 | 示例 | 被哪些文件使用 |
|------|------|------|---------------|
| `title` | string | `"BYQ0002"` | nav.html (Logo), footer.html (版权), head.html |
| `SEOTitle` | string | `"BYQ0002"` | head.html (浏览器标签页标题) |
| `header-img` | string | `"img/64724388_p0.png"` | page.html, post.html, keynote.html (默认背景图) |
| `description` | string | ≤160 字符 | head.html (`<meta name="description">`) |
| `keyword` | string | 逗号分隔 | head.html (`<meta name="keywords">`) |
| `url` | string | `"https://xxx.github.io"` | head.html (canonical URL), Disqus |
| `baseurl` | string | `""` 或 `"/blog"` | 全站路径拼接 (head/nav/footer) |
| `google_site_verification` | string (可选) | `"xBT4GhY..."` | head.html (Google Search Console 验证) |

### 侧边栏配置

| 变量 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `sidebar` | bool | `true` | `true`=桌面端并排 / `false`=内容全宽 |
| `sidebar-avatar` | string | — | 头像图片 URL (`/img/xxx.png`) |
| `sidebar-about-description` | string | — | 个人简介文字 |
| `email` | string (可选) | — | 邮箱 (侧边栏 ABOUT ME) |

### 社交平台

| 变量 | 格式 | 图标类型 |
|------|------|----------|
| `RSS` | `true` / `false` | Font Awesome `fa-rss` |
| `jianshu_username` | 用户 ID (数字) | 自定义文字 `简` |
| `twitter_username` | 用户名 (不含 @) | `fa-twitter` |
| `zhihu_username` | 用户 ID (people/ 后) | 自定义文字 `知` |
| `weibo_username` | 用户 ID (数字) | `fa-weibo` |
| `facebook_username` | 用户名 | `fa-facebook` |
| `github_username` | 用户名 | `fa-github` |
| `linkedin_username` | 用户名 (in/ 后) | `fa-linkedin` |

> 详细说明见 `_includes/social-icon.html` 文件头注释。

### 评论系统

| 方案 | 启用变量 | 说明 |
|------|----------|------|
| **Gitalk** | `site.gitalk.enable` | GitHub Issues 作为后端 |
| **Disqus** | `site.disqus_username` (post.html) 或 `site.disqus.enable` (keynote.html) | 第三方评论服务 |

⚠ 两种方案的启用判断方式不同（历史遗留），建议统一。详见 `post.html` 文件头注释。

### 统计分析

| 变量 | 格式 | 状态 |
|------|------|------|
| `ga_track_id` | `"UA-XXXXX-Y"` | ⚠ UA 版 2023-07 停用，建议换 GA4 (`G-XXXXXXXX`) |
| `ga_domain` | `"auto"` / `"example.com"` / `"none"` | Cookie 域名 |
| `ba_track_id` | 32 位十六进制 | 百度统计后台获取 |

### 首页 & 标签

| 变量 | 说明 |
|------|------|
| `featured-tags` | `true`=侧边栏显示精选标签 |
| `featured-condition-size` | 标签最少文章数阈值 (`1`=全部显示) |

### PWA

| 变量 | 值 |
|------|-----|
| `chrome-tab-theme-color` | `"#RRGGBB"` (Android Chrome 标签页颜色) |
| `service-worker` | `true` / `false` |

### 友链

```yaml
friends:
  - title: "朋友的博客"
    href: "https://friend.example.com"
```

### 构建配置

| 变量 | 值 | 说明 |
|------|-----|------|
| `permalink` | `"pretty"` | `/2024/01/01/title/` 格式 |
| `paginate` | `10` | 首页每页文章数 |
| `anchorjs` | `true` | 文章标题锚点链接 |
| `markdown` | `"kramdown"` | Markdown 引擎 |
| `highlighter` | `"rouge"` | 代码高亮器 |
| `exclude` | 数组 | 构建时排除的目录/文件 |

---

## 社交图标配置

### 新增平台步骤

1. 在 `_config.yml` 中添加用户名变量 (如 `mastodon_username`)
2. 在 `footer.html` 中添加 `{% include %}` 调用
3. 如果平台有 Font Awesome 4 图标: 传 `icon="xxx"`
4. 如果没有: 传 `text="文字"` 显示自定义文字

```liquid
{% if site.mastodon_username %}
  {% include social-icon.html url="https://mastodon.social/@{{ site.mastodon_username }}" icon="mastodon" external=true %}
{% endif %}
```

### `social-icon.html` 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `url` | 是 | 链接地址 |
| `icon` | 与 text 二选一 | Font Awesome 4 图标后缀，如 `"github"` → `fa-github` |
| `text` | 与 icon 二选一 | 自定义文字 (无 FA 图标的平台，如 `"简"`) |
| `external` | 否 (默认 false) | `true`=新标签页打开 + `rel="noopener noreferrer"` |

---

## 评论系统配置 (Gitalk / Disqus)

### Gitalk (`_config.yml` 模板)

```yaml
gitalk:
  enable: true
  clientID: "GitHub OAuth App Client ID"
  clientSecret: "GitHub OAuth App Client Secret"
  repo: "仓库名"
  owner: "仓库所有者"
  admin: "管理员用户名"
  distractionFreeMode: true
```

### Gitalk ID 策略差异

| 页面 | ID 值 | 原因 |
|------|-------|------|
| `post.html` | `md5(location.pathname)` | 路径可能超 50 字符限制，MD5 固定 32 字符 |
| `keynote.html` | `window.location.pathname` | 演示页路径通常较短 |
| `about.html` | `'about'` (固定字符串) | 所有关于页评论集中在一个 Issue |

### Disqus

```yaml
# _config.yml
disqus_username: "你的Disqus短名称"
```

⚠ `keynote.html` 使用 `site.disqus.enable` 判断，`post.html` 使用 `site.disqus_username`，两者不一致。

---

## 统计分析配置 (GA / 百度)

### Google Analytics

```yaml
ga_track_id: 'UA-90855596-1'    # ⚠ UA 版已停用
ga_domain: auto                  # auto=自动检测, none=本地测试
```

### 百度统计

```yaml
ba_track_id: b50bf2b12b5338a1845e33832976fd68
```

> 百度统计 ID 在后台 "管理 → 代码获取" 中查看。

---

## Jekyll 模板速查

### 常用 Liquid 语法

{% raw %}
| 语法 | 说明 |
|------|------|
| `{% if site.xxx %}` | 检查 `_config.yml` 中是否有值 |
| `{% if page.xxx %}` | 检查当前页面 front-matter 中是否有值 |
| `{{ site.xxx }}` | 输出配置值 |
| `{{ page.xxx }}` | 输出页面变量 |
| `{% include xxx.html %}` | 引入 `_includes/` 下的组件 |
| `{% for x in y %}` | 循环 |
| `{% capture var %}...{% endcapture %}` | 捕获内容为变量 |
| `{{ "path" \| prepend: site.baseurl }}` | 路径拼接 |
| `{{ text \| strip_html \| truncate:200 }}` | 过滤链：去 HTML → 截 200 字符 |
| `{{ page.url \| replace:'A','B' }}` | 字符串替换 |
{% endraw %}

### 常用 front-matter 变量

| 变量 | 用于 | 说明 |
|------|------|------|
| `layout` | 所有页面 | `default` / `page` / `post` / `keynote` |
| `title` | 所有页面 | 页面/文章标题 |
| `description` | page 布局 | 头部副标题 |
| `subtitle` | post 布局 | 文章副标题 |
| `header-img` | page/post | 头部背景图 |
| `header-mask` | post (可选) | 头部遮罩透明度 0.0~1.0 |
| `catalog` | post (可选) | `true`=显示侧边目录 |
| `mathjax` | post (可选) | `true`=加载 MathJax |
| `tags` | post | 标签数组 `["tag1", "tag2"]` |
| `author` | post (可选) | 作者名 |
| `iframe` | keynote | iframe URL |
| `navcolor` | keynote (可选) | `"invert"`=导航栏反色 |

### 布局继承链

```
tags.html  ─┐
post.html  ─┼── layout: default
page.html  ─┤
keynote.html─┘       │
                     ▼
              default.html
               ├── head.html
               ├── nav.html
               ├── {{ content }}
               └── footer.html
```

---

## RSS / Feed 配置

| 文件 | URL | 说明 |
|------|-----|------|
| `feed.xml` | `/feed.xml` | RSS 2.0 订阅源 |

### 自定义 RSS

| 需求 | 修改位置 |
|------|----------|
| 改变文章数量 | `feed.xml` 第 8 行的 `limit:10` |
| 改用摘要 | 将 `post.content` 改为 `post.excerpt` |
| 添加频道图标 | 在 `<channel>` 中添加 `<image>` 元素 |

### RSS 元素速查

| 元素 | 必填 | 说明 |
|------|------|------|
| `<channel>` | 是 | RSS 频道根 |
| `<title>` | 是 | 频道名 |
| `<description>` | 是 | 频道描述 |
| `<link>` | 是 | 网站 URL |
| `<atom:link>` | 推荐 | Atom 自引用 |
| `<item>` | 是 | 文章条目 |
| `<guid>` | 推荐 | 唯一标识 (去重用) |
| `<category>` | 否 | 标签/分类 |

---

## PWA 配置

### 启用条件

1. `_config.yml` 中 `service-worker: true`
2. `sw.js` 存在于站点根目录
3. `pwa/manifest.json` 配置完整
4. 站点通过 HTTPS 访问 (localhost 除外)

### `manifest.json` 字段

| 字段 | 必填 | 值 | 说明 |
|------|------|-----|------|
| `name` | 是 | `"BY Blog"` | 应用全名 |
| `short_name` | 推荐 | `"BY Blog"` | 主屏幕图标下方 (≤12 字符) |
| `start_url` | 是 | `"/"` | 启动 URL |
| `display` | 推荐 | `"standalone"` | 隐藏地址栏 |
| `orientation` | 否 | `"portrait"` | 强制竖屏 / `"any"` 跟随旋转 |
| `background_color` | 推荐 | `"#fff"` | 启动画面背景色 |
| `theme_color` | 推荐 | `"#000"` | 状态栏颜色 |
| `icons` | 是 | 数组 | 至少 192px + 512px |
| `scope` | 推荐 | `"/"` | ⚠ 当前未设, 建议添加 |

### 安装条件 (Chrome)

- 有效的 manifest.json
- 已注册 Service Worker
- HTTPS 访问
- 用户有足够交互

---

## CSS / Less 构建

### 修改样式的工作流

```
1. 编辑 less/*.less (源文件)
2. 运行 grunt less (编译 → css/)
3. 或 grunt watch (自动监听编译)
```

### 编译命令

```bash
npm install -g less          # 安装 Less 编译器
lessc less/hux-blog.less > css/hux-blog.css        # 展开版
lessc --clean-css less/hux-blog.less > css/hux-blog.min.css  # 压缩版
```

### Less 变量速查 (`less/variables.less`)

| 变量 | 值 | CSS 颜色 | 用途 |
|------|-----|----------|------|
| `@brand-primary` | `#0085a1` | 蓝绿色 | 链接悬停/按钮主色/选中文本 |
| `@gray-dark` | `#404040` | 深灰 | 正文文字 |
| `@gray` | `#808080` | 灰 | 次要文字/图标 |
| `@gray-l` | `#bfbfbf` | 浅灰 | 侧边栏弱化文字 |
| `@gray-light` | `#eee` | 浅灰 | 边框/分隔线 |
| `@white-faded` | `fade(white, 80%)` | 半透明白 | 导航栏悬停 |

### Less Mixin 速查 (`less/mixins.less`)

| Mixin | 用途 | 调用处 |
|-------|------|--------|
| `.sans-serif()` | 跨平台系统字体栈 + `line-height:1.7` | body, h1~h6, navbar, btn 等 |
| `.serif()` | 衬线字体 (Lora) | post-meta 元信息 |
| `.background-cover()` | 背景图 cover 模式 | .intro-header |
| `.transition-all()` | 全局过渡 (⚠ 未调用) | — |

### CSS 分段索引 (`hux-blog.css`)

| 段 | 选择器 | 功能 |
|----|--------|------|
| 1 | `.sidebar-container`, `.side-catalog` | 侧边栏 & 目录 |
| 2 | `body`, `a`, `h1~h6` | 基础排版 |
| 3 | `.post-container`, `.pager` | 文章容器 |
| 4 | `#huxblog_navbar` | 导航栏动画 (Material Design) |
| 5 | `.navbar-custom` | 导航栏外观 (.is-fixed/.is-visible) |
| 6 | `.intro-header` | 页面头部 |
| 7 | `.post-preview` | 文章预览卡片 |
| 8 | `footer` | 页脚 |
| 9 | `.floating-label-form-group` | 浮动标签表单 |
| 10 | `.btn`, `.pager` | 按钮 & 翻页 |
| 11 | `::selection` | 文本选择颜色 |
| 12 | `.tags`, `#tag_cloud` | 标签样式 |
| 13 | `.post-container img`, `.navbar-toggle` | 图片 & 杂项 |
| 14 | `.comment #ds-thread` | ⚠ 多说 (2017 关闭) |
| 15 | `.page-fullscreen` | 全屏页面 |

### 代码高亮 (`syntax.css`)

Rouge Token 类名速查：

| 类别 | 类名 | 含义 |
|------|------|------|
| 注释 | `.c`, `.cm`, `.c1`, `.cp`, `.cs` | Comment |
| 关键字 | `.k`, `.kc`, `.kd`, `.kn`, `.kp`, `.kr`, `.kt` | Keyword |
| 字符串 | `.s`, `.sb`, `.sc`, `.s2`, `.sr`, `.s1`, `.ss` | String |
| 数字 | `.m`, `.mf`, `.mh`, `.mi`, `.mo`, `.il` | Number |
| 名称 | `.n`, `.na`, `.nb`, `.nc`, `.nf`, `.nv` | Name |
| 运算符 | `.o`, `.ow` | Operator |
| 错误 | `.err` | Error |
| Diff | `.gd`, `.gi`, `.gh` | Deleted/Inserted/Heading |

---

## npm / Grunt 命令

### npm scripts (`package.json`)

| 命令 | 作用 |
|------|------|
| `npm run preview` | Python 2 预览 `_site/` (端口 8020) |
| `npm run py3view` | Python 3 预览 (推荐) |
| `npm run watch` | Grunt 监听 + Jekyll 实时编译 + 预览 |
| `npm run py3wa` | 同上 (Python 3 版本) |
| `npm run push` | Git 推送 master + 标签 |
| `npm run boil` | 推送模板分支 (Hux 项目同步用) |
| `npm run cafe` | ⚠ GitCafe (2016 年已关闭) |

### Grunt 任务 (`Gruntfile.js`)

| 命令 | 执行的任务 |
|------|-----------|
| `grunt` | uglify + less + usebanner (默认) |
| `grunt watch` | 监听文件变化自动构建 |
| `grunt uglify` | JS 压缩 (`hux-blog.js` → `.min.js`) |
| `grunt less` | Less 编译 (展开版 + 压缩版) |

### 构建流程

```
grunt
  ├─ uglify     hux-blog.js → hux-blog.min.js (UglifyJS 压缩)
  ├─ less       hux-blog.less → hux-blog.css (展开版)
  │             hux-blog.less → hux-blog.min.css (CleanCSS 压缩)
  └─ usebanner  输出文件顶部添加版权横幅
```

---

## CI / CD 配置

### Travis CI (`.travis.yml`)

| 阶段 | 命令 | 说明 |
|------|------|------|
| install | `gem install jekyll jekyll-paginate` | 安装依赖 |
| script | `jekyll build` | 编译站点 |
| after_success | Codecov 上报 (⚠ 博客无测试, 已注释) | — |

⚠ Travis CI 免费计划 2020 年关闭，建议迁移到 GitHub Actions。

### 部署模板 (取消注释后启用)

```yaml
deploy:
  provider: pages
  skip_cleanup: true
  github_token: $GITHUB_TOKEN
  local_dir: _site
  target_branch: gh-pages
  on:
    branch: master
```

### Codecov (`codecov.yml`)

- ⚠ 代码覆盖率服务，博客项目通常不需要
- API Token 建议移至 CI 环境变量而非提交到仓库

---

## Service Worker (`sw.js`)

### 生命周期

| 事件 | 触发时机 | 功能 |
|------|----------|------|
| `install` | 首次安装 / SW 版本更新 | 预缓存 `offline.html` → 立即激活 |
| `activate` | 新 SW 接管控制权 | `self.clients.claim()` 立即控制所有页面 |
| `fetch` | 每次网络请求 | Stale-While-Revalidate 缓存策略 |

### 缓存策略: Stale-While-Revalidate

```
请求资源
  ├─ 有缓存 → 立即返回缓存 (秒开)
  │           └─ 后台发起网络请求 → 更新缓存
  ├─ 无缓存 → 等待网络请求 → 返回 + 写入缓存
  └─ 网络失败 + 无缓存 → 返回 offline.html (离线提示页)
```

### 常量配置

| 常量 | 值 | 说明 |
|------|-----|------|
| `PRECACHE` | `'precache-v1'` | 预缓存名称 (改版本号清空旧缓存) |
| `RUNTIME` | `'runtime'` | 运行时动态缓存名称 |
| `HOSTNAME_WHITELIST` | 数组 | 仅拦截白名单域名的请求 |

### 工具函数

| 函数 | 参数 | 返回值 | 功能 |
|------|------|--------|------|
| `getFixedUrl(req)` | Request | string (URL) | 协议同步 + 添加 cache-bust 时间戳 |
| `isNavigationReq(req)` | Request | boolean | 判断是否为页面导航请求 |
| `endWithExtension(req)` | Request | boolean | URL 是否以文件扩展名结尾 |
| `shouldRedirect(req)` | Request | boolean | GitHub Pages 目录 404 重定向修复 |
| `getRedirectUrl(req)` | Request | string (URL) | 生成尾部加 `/` 的重定向 URL |

### 关键修复

| 修复 | 说明 |
|------|------|
| GitHub Pages 目录 404 | `/tags` → 302 → `/tags/` (GH Pages 对无尾斜杠目录返回 404) |
| Cache-Bust 时间戳 | GitHub Pages max-age=600s, 加时间戳跳过 HTTP 缓存, 由 SW 自己管理 |
| 离线回退 | 网络失败 + 缓存为空 → 返回 `offline.html` |

---

## 常见修改指南

### 改站点标题/描述
→ `_config.yml` 的 `title`, `SEOTitle`, `description`

### 新增社交平台图标
→ `_config.yml` 加用户名 → `footer.html` 加 {% raw %}`{% include social-icon.html %}`{% endraw %}

### 修改导航栏菜单
→ `_includes/nav.html` 的 {% raw %}`{% for page in site.pages %}`{% endraw %} 循环

### 修改首页文章数
→ `_config.yml` 的 `paginate`

### 修改代码高亮配色
→ `css/syntax.css` (Rouge token 颜色)

### 修改全局主题色
→ `less/variables.less` 的 `@brand-primary` → 重新编译

### 启用/禁用评论
→ `_config.yml` 的 `gitalk.enable` 或 `disqus_username`

### 启用/禁用统计
→ `_config.yml` 的 `ga_track_id` 或 `ba_track_id`

### 启用 PWA
→ `_config.yml` 的 `service-worker: true` → `pwa/manifest.json` 配置完整

### 自定义标签页
→ `tags.html` — 标签云数据来自 `site.tags`, 权重值通过 `rel` 属性传给 `jquery.tagcloud.js`

---

> 最后更新: 2026-06-30
> 基于 Hux Blog v1.7.0 主题
