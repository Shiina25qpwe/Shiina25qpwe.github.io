# BY Blog — Jekyll 静态博客使用指南

> 基于 [Hux Blog](https://github.com/Huxpro/huxpro.github.io) 主题的自用博客，部署于 GitHub Pages。
> 本指南覆盖博客的每一项功能、每个配置参数、每个页面的修改方法。

---

## 目录

- [快速开始](#快速开始)
- [目录结构](#目录结构)
- [全局配置 _config.yml](#全局配置-_configyml)
- [页面说明与修改指南](#页面说明与修改指南)
  - [首页 index.html](#首页-indexhtml)
  - [文章页 post 布局](#文章页-post-布局)
  - [标签页 tags.html](#标签页-tagshtml)
  - [关于页 about.html](#关于页-abouthtml)
  - [404 页面](#404-页面)
  - [离线页 offline.html](#离线页-offlinehtml)
  - [RSS 订阅 feed.xml](#rss-订阅-feedxml)
  - [黑夜模式](#黑夜模式)
- [布局系统](#布局系统)
  - [default 布局](#default-布局)
  - [page 布局](#page-布局)
  - [post 布局](#post-布局)
  - [keynote 布局](#keynote-布局)
- [包含组件 _includes](#包含组件-_includes)
- [样式系统 Less](#样式系统-less)
- [JavaScript 脚本](#javascript-脚本)
- [PWA 离线支持](#pwa-离线支持)
- [构建工具 Grunt](#构建工具-grunt)
- [评论系统](#评论系统)
- [网站统计](#网站统计)
- [如何写文章](#如何写文章)
- [已知问题与注意](#已知问题与注意)

---

## 快速开始

### 环境要求

- **Ruby** ≥ 2.7（Jekyll 运行环境）
- **Node.js**（Grunt 构建工具，可选）
- **Git**（版本管理 + 部署）

### 本地预览

```bash
# 1. 安装 Jekyll
gem install jekyll jekyll-paginate

# 2. 启动开发服务器（自动监听文件变化）
jekyll serve

# 3. 浏览器打开
# http://localhost:4000
```

### 部署到 GitHub Pages

```bash
git add .
git commit -m "更新博客"
git push origin master
# GitHub Pages 自动构建，1-2 分钟后生效
```

---

## 目录结构

```
.
├── _config.yml              # 🔧 全局配置文件（博客所有设置）
├── _layouts/                # 布局模板（页面骨架）
│   ├── default.html         #   基础布局（HTML 框架）
│   ├── page.html            #   通用页面布局（首页、标签页等）
│   ├── post.html            #   文章详情页布局
│   └── keynote.html         #   嵌入式页面布局（全屏 iframe）
├── _includes/               # 可复用组件（被布局引用）
│   ├── head.html            #   <head> 标签（meta、CSS、字体、MathJax）
│   ├── nav.html             #   顶部导航栏
│   ├── footer.html          #   页脚 + JS 加载 + Service Worker 注册
│   ├── social-icon.html     #   社交图标组件
│   └── anchor-js.html       #   标题锚点链接（# 图标）
├── _posts/                  # 📝 文章（Markdown 文件）
├── index.html               # 首页（文章列表 + 分页）
├── tags.html                # 标签聚合页
├── about.html               # 关于页面
├── 404.html                 # 404 错误页
├── offline.html             # PWA 离线页
├── feed.xml                 # RSS 订阅源
├── less/                    # Less 样式源码
│   ├── hux-blog.less        #   主题主样式
│   ├── mixins.less          #   Mixin 混合（字体、动画）
│   ├── variables.less       #   变量（颜色等）
│   ├── sidebar.less         #   侧边栏样式
│   └── side-catalog.less    #   侧边目录样式
├── css/                     # 编译后的 CSS
│   ├── bootstrap.css/min.css#   Bootstrap 样式
│   ├── hux-blog.css/min.css #   主题样式（Less 编译输出）
│   ├── dark-mode.css        #   黑夜模式样式
│   └── syntax.css           #   代码高亮样式
├── js/                      # JavaScript 脚本
│   ├── hux-blog.js          #   主题主脚本（未压缩源文件）
│   ├── hux-blog.min.js      #   主题主脚本（压缩版，生产使用）
│   ├── jquery.nav.js        #   单页导航插件（侧边目录滚动监听）
│   ├── jquery.tagcloud.js   #   标签云插件（根据权重控制字号颜色）
│   ├── jquery.js/min.js     #   jQuery 库
│   ├── bootstrap.js/min.js  #   Bootstrap 库
│   └── md5.min.js           #   MD5 哈希（Gitalk 评论用）
├── img/                     # 图片资源
├── fonts/                   # 图标字体（Glyphicons）
├── pwa/                     # PWA 相关
│   ├── manifest.json        #   Web App Manifest
│   └── icons/               #   PWA 图标
├── sw.js                    # Service Worker（离线缓存）
├── Gruntfile.js             # Grunt 构建脚本
├── package.json             # Node.js 依赖配置
├── .travis.yml              # Travis CI 配置（自动构建验证）
└── .gitignore               # Git 忽略规则
```

---

## 全局配置 _config.yml

这是博客的**核心配置文件**，所有全局设置都在这里。修改后需重启 Jekyll 才能生效。

### 站点基本设置

```yaml
title: BYQ0002                  # 博客标题（显示在首页大图和标签页）
SEOTitle: BYQ0002               # SEO 标题（搜索引擎结果中显示）
header-img: img/64724388_p0.png # 首页背景大图路径
description: "主要写ACG相关随笔的备用博客"  # 站点描述（<meta> 标签和 RSS 用）
keyword: "anime, comic, game"   # 关键词（逗号分隔）
url: "https://byq0002.github.io/"  # 站点完整 URL（末尾不加 /）
baseurl: ""                     # 子路径（根目录部署为空，如 /blog 则填 "/blog"）
```

**修改指南：**
- 更换博客名 → 改 `title` 和 `SEOTitle`
- 更换首页背景 → 改 `header-img`（图片放到 `img/` 目录）
- 修改描述和关键词 → 改 `description` 和 `keyword`（影响 SEO）

### 侧边栏设置

```yaml
sidebar: true                              # 是否显示侧边栏（true=显示，false=隐藏）
sidebar-about-description: "这个人很懒,他什么都没写"  # 侧边栏个人简介
sidebar-avatar: /img/18614610_p0.png       # 侧边栏头像路径
```

**修改指南：**
- 关闭侧边栏 → `sidebar: false`（文章列表会变全宽，精选标签移到下方）
- 换头像 → 替换图片后改 `sidebar-avatar`
- 改简介 → 改 `sidebar-about-description`

### 社交链接

```yaml
RSS: false                    # RSS 订阅开关
# weibo_username: qiubaiying  # 微博用户名（取消 # 注释即可启用）
# zhihu_username: qiubaiying  # 知乎用户名
# github_username: qiubaiying # GitHub 用户名
# twitter_username: qiubaiying# Twitter 用户名
```

**修改指南：**
- 启用某个社交平台 → 去掉对应行的 `#` 并填入你的用户名
- RSS 开关 → `RSS: true` 在页脚和侧边栏显示 RSS 订阅图标
- 社交图标使用 Font Awesome 4 图标或自定义文字（如简书="简"、知乎="知"）

### 构建设置

```yaml
permalink: pretty             # 文章 URL 格式（pretty = /:categories/:year/:month/:day/:title/）
paginate: 10                  # 首页每页显示文章数
plugins: [jekyll-paginate]    # Jekyll 插件（分页必需）
anchorjs: true                # 标题锚点链接开关

exclude:
  - "less"
  - "node_modules"
  - "Gruntfile.js"
  - "package.json"
  - "README.md"
```

### Markdown 设置

```yaml
markdown: kramdown            # Markdown 引擎（支持 GFM 语法）
highlighter: rouge            # 代码高亮引擎
kramdown:
  input: GFM                  # 启用 GitHub Flavored Markdown
```

### 特色标签

```yaml
featured-tags: true           # 首页/侧边栏是否显示热门标签
featured-condition-size: 1    # 标签出现次数 ≥ 此值才显示（调大筛选更热门的标签）
```

### PWA 设置

```yaml
chrome-tab-theme-color: "#000000"  # Chrome 浏览器标签栏颜色（需加引号！）
service-worker: true               # 是否启用 Service Worker 离线缓存
```

**注意：** `chrome-tab-theme-color` 的值必须用引号包裹，因为 `#` 在 YAML 中是注释符。

### 统计代码

```yaml
# 百度统计
# ba_track_id: b50bf2b12b5338a1845e33832976fd68

# Google Analytics
# ga_track_id: 'UA-90855596-1'
# ga_domain: auto
```

**启用方法：** 去掉注释，填入你的统计 ID。百度统计在 https://tongji.baidu.com/ 注册，Google Analytics 在 https://analytics.google.com/ 注册。

### 评论系统

```yaml
# Gitalk（基于 GitHub Issues）
# gitalk:
#   enable: true
#   clientID: xxx        # GitHub OAuth App Client ID
#   clientSecret: xxx    # Client Secret
#   repo: username.github.io
#   owner: username
#   admin: username
#   distractionFreeMode: true

# Disqus
# disqus_username: qiubaiying
```

### 友链

```yaml
# friends:
#   - title: "WY"
#     href: "http://zhengwuyang.com"
#   - title: "Apple"
#     href: "https://apple.com"
```

---

## 页面说明与修改指南

### 首页 index.html

**文件：** `index.html` | **布局：** `page`

**功能：** 展示最近 10 篇文章的预览卡片列表，底部有上一页/下一页按钮。

**数据流：**
```
_config.yml (paginate: 10)
    → Jekyll 分页器 (jekyll-paginate 插件)
    → index.html 遍历 paginator.posts
    → 每篇文章渲染为 .post-preview 卡片
```

**修改指南：**

| 需求 | 方法 |
|------|------|
| 修改每页文章数 | `_config.yml` → `paginate: 10`（改数字） |
| 修改摘要长度 | `index.html` → `truncate:200`（改数字，200=约100个中文字） |
| 改成按词截断 | `truncate:200` → `truncatewords:30` |
| 使用 Jekyll 内置摘要 | `post.content \| strip_html \| truncate:200` → `post.excerpt` |
| 修改日期格式 | `"%B %-d, %Y"` 改格式串（如 `"%Y-%m-%d"` 为 `2026-07-01`） |
| 隐藏作者名 | 删除 `Posted by ... on` 之间的代码 |
| 修改分页按钮文字 | `Newer Posts` / `Older Posts` 改文字 |

### 文章页 post 布局

**文件：** `_layouts/post.html` | **文章：** `_posts/YYYY-MM-DD-标题.md`

**功能：** 文章详情页，包含封面大图、标签、标题、正文、上下篇导航、评论区、侧边目录。

**文章 Front Matter 所有可用参数：**

```yaml
---
layout: post                    # 布局（不要改）
title: 文章标题                  # 必填
subtitle: 副标题                 # 可选（不填也渲染空的 h2 占位）
date: 2025-10-28                # 日期（影响排序和 URL）
author: BYQ0002                 # 作者（不填则使用 site.title）
header-img: img/xxx.jpg         # 封面背景图（不填则使用 site.header-img）
header-mask: 0.3                # 封面遮罩透明度（0~1，0=无遮罩，1=全黑）
catalog: true                   # 是否显示侧边目录（扫描 h1~h6 自动生成）
mathjax: true                   # 是否启用 LaTeX 数学公式渲染
tags:                           # 标签列表
    - 标签1
    - 标签2
---
```

**修改指南：**

| 需求 | 方法 |
|------|------|
| 添加封面遮罩 | 在 front matter 加 `header-mask: 0.3`（值越大越暗） |
| 启用侧边目录 | `catalog: true`（自动扫描文章内 h1~h6 标题生成） |
| 禁用数学公式 | 删除 `mathjax: true`（减少 MathJax.js 加载） |
| 修改上下篇导航文字 | `post.html` 中 `Previous` / `Next` 改文字 |
| 去掉副标题占位 | 删除 `post.html` 中 `<h2 class="subheading">` 和对应的 `{% comment %}` 包裹 |

### 标签页 tags.html

**文件：** `tags.html` | **布局：** `default` | **URL：** `/tags/`

**功能：** 标签云（字号按文章数量变化）+ 按标签分组的文章列表。

**修改指南：**

| 需求 | 方法 |
|------|------|
| 修改标签云颜色范围 | `_includes/footer.html` → `color: {start: '#bbbbee', end: '#0085a1'}` |
| 修改标签云字号范围 | `_includes/footer.html` → 取消注释 `size: {start: 1, end: 1, unit: 'em'}` |
| 修改标签分隔符样式 | `less/hux-blog.less` → `.listing-seperator` 选择器 |
| 关闭标签云 | 移除 `footer.html` 中 `$('#tag_cloud').length` 相关的整个 `<script>` 块 |

### 关于页 about.html

**文件：** `about.html` | **布局：** `page` | **URL：** `/about/`

**功能：** 个人介绍页面，支持评论。

**修改指南：**

| 需求 | 方法 |
|------|------|
| 修改自我介绍 | 直接编辑 `about.html` 中的 `<p>` 段落 |
| 修改页面背景图 | front matter → `header-img: "img/xxx.jpg"` |
| 修改页面描述 | front matter → `description: "xxx"` |
| 启用评论 | 在 `_config.yml` 中配置 Gitalk 或 Disqus |

### 404 页面

**文件：** `404.html` | **布局：** `default` | **URL：** 自动（访问不存在页面时）

**功能：** 全屏错误提示页，通过 `page-fullscreen` CSS 类实现垂直居中。

**修改指南：**

| 需求 | 方法 |
|------|------|
| 修改提示文字 | front matter → `description: "xxx"` |
| 修改背景图 | front matter → `header-img: "img/xxx.jpg"` |
| 修改标题 | `<h1>404</h1>` 改为其他文字 |

### 离线页 offline.html

**文件：** `offline.html` | **布局：** `default`

**功能：** Service Worker 在离线时返回的兜底页面。结构与 404.html 完全相同。

**修改指南：** 同 404 页面。**注意：** 修改后需清除浏览器 SW 缓存才能看到效果（或修改 `sw.js` 中的 `PRECACHE` 版本号）。

### RSS 订阅 feed.xml

**文件：** `feed.xml` | **URL：** `/feed.xml`

**功能：** RSS 2.0 订阅源（最近 10 篇文章全文输出）。

**修改指南：**

| 需求 | 方法 |
|------|------|
| 改成摘要输出 | `post.content` → `post.excerpt` |
| 更改文章数量 | `limit:10` 改数字 |

---

## 黑夜模式

### 工作原理

黑夜模式通过四个组件协同工作，所有页面共享（因为都继承自 `default.html` 布局）：

```
用户打开页面
  → head.html 防闪烁脚本：读取 localStorage / 系统偏好 → 设置 <html data-theme="dark">
  → dark-mode.css：通过 [data-theme="dark"] 选择器覆盖所有亮色样式
  → nav.html：导航栏右侧显示 🌙/☀️ 切换按钮
  → footer.html 切换 JS：点击按钮 → 更新 data-theme + localStorage + 浏览器标签颜色
```

### 颜色体系

所有暗色颜色定义在 `css/dark-mode.css` 中，采用 CSS 变量约定（注释中标注，方便快速定位）：

| 变量 | 色值 | 用途 |
|------|------|------|
| `--bg-primary` | `#1b1b1b` | 页面主背景 |
| `--bg-surface` | `#252525` | 卡片/容器背景 |
| `--bg-elevated` | `#2d2d2d` | 浮层/导航背景 |
| `--text-primary` | `#d4d4d4` | 正文文字 |
| `--text-secondary` | `#999` | 次要文字 |
| `--text-muted` | `#777` | 最淡文字 |
| `--border` | `#404040` | 边框/分割线 |
| `--brand` | `#0099b8` | 品牌色（暗色下稍亮） |
| `--link` | `#4db8cc` | 正文链接色 |

### 覆盖范围

`dark-mode.css` 共 22 节，覆盖以下区域：

| 节 | 覆盖内容 |
|----|---------|
| 1-4 | 全局基础、排版、表格、代码块/语法高亮 |
| 5-7 | 导航栏、首页大图、文章预览卡片 |
| 8 | 文章详情页（正文链接、h5/h6、分页导航） |
| 9-11 | 通用区块、侧边栏、侧边目录 |
| 12-18 | 页脚、标签系统、分页器、按钮、表单、下拉框、文本选中 |
| 19-21 | 404/全屏页面、说说评论、Gitalk 评论区 |
| 22 | 主题切换按钮样式（桌面/移动端） |

### 用户操作

- **切换**：点击导航栏右侧的 🌙/☀️ 按钮
- **记忆**：用户选择存入 `localStorage['theme']`，下次访问自动恢复
- **跟随系统**：若用户从未手动切换，首次访问时跟随 `prefers-color-scheme: dark` 系统设置
- **系统切换响应**：当用户未手动设置主题时，系统切换亮/暗模式会自动跟随

### 修改指南

| 需求 | 方法 |
|------|------|
| 修改暗色背景色 | `css/dark-mode.css` → 搜索 `#1b1b1b` 替换 |
| 修改暗色文字颜色 | `css/dark-mode.css` → 搜索 `#d4d4d4` 替换 |
| 修改暗色品牌色 | `css/dark-mode.css` → 搜索 `#0099b8` 替换 |
| 修改切换按钮图标 | `footer.html` → `updateIcon()` 中的 `☀️` / `🌙` → 换成其他 emoji 或文字 |
| 关闭黑夜模式 | 1. 删除 `nav.html` 中的按钮 `<li>` 2. 删除 `footer.html` 中"黑夜模式切换逻辑"script 块 3. 删除 `head.html` 中防闪烁脚本 4. 删除 `css/dark-mode.css` 的 `<link>` |
| 新增某区域的暗色覆盖 | 在 `css/dark-mode.css` 末尾追加 `[data-theme="dark"] 你的选择器 { ... }` |

---

## 布局系统

博客使用 Jekyll 布局继承体系：`default → page/post/keynote`

### default 布局

**文件：** `_layouts/default.html`

所有页面的**根布局**，提供完整的 HTML 骨架：

```
<!DOCTYPE html> → head.html → nav.html → {{ content }} → footer.html
```

**包含的内容：**
- `<head>` 标签（meta、CSS、字体、MathJax）→ 来自 `head.html`
- 导航栏 → 来自 `nav.html`
- 页面内容 → `{{ content }}`（子布局填充）
- 页脚 + JS 脚本 → 来自 `footer.html`
- 微信分享 hack → 隐藏的 `<img>` 标签

### page 布局

**文件：** `_layouts/page.html` | **父布局：** `default`

用于**首页、关于页**等通用页面。包含封面大图 + 正文区 + 侧边栏。

**两种显示模式（由 `site.sidebar` 控制）：**

```
sidebar: true（默认）:
  ┌──────────────┬──────────┐
  │  文章列表      │  侧边栏   │
  │  (col-lg-8)   │ (col-3)  │
  └──────────────┴──────────┘

sidebar: false:
  ┌─────────────────────────┐
  │  文章列表（全宽居中）      │
  │  精选标签 + 友链（下方）   │
  └─────────────────────────┘
```

**侧边栏内容来源：**
- 个人简介 → `_config.yml` 的 `sidebar-avatar`、`sidebar-about-description`、`email`
- 社交图标 → `social-icon.html` 组件（根据 `_config.yml` 中填写的用户名按需显示）
- 精选标签 → `_config.yml` 的 `featured-tags` 和 `featured-condition-size`
- 友情链接 → `_config.yml` 的 `friends`

### post 布局

**文件：** `_layouts/post.html` | **父布局：** `default`

用于**文章详情页**。相比 page 布局多了：
- 封面遮罩层（`header-mask`）
- 文章标签显示（封面区）
- 上下篇导航
- 侧边目录（`catalog: true` 时显示）
- 评论区（Gitalk / Disqus）
- 标题锚点链接（anchor-js）

### keynote 布局

**文件：** `_layouts/keynote.html` | **父布局：** `default`

用于**嵌入 iframe 的页面**（如演示文稿、交互式内容）。特点：
- 封面区改为 `<iframe>` 嵌入外部页面
- 封面高度自适应窗口大小（保留 85px 余量）
- 导航栏可反色（`navcolor: "invert"`）
- 自动监听窗口 resize 事件

**专属 Front Matter 参数：**

```yaml
---
layout: keynote
iframe: "https://example.com/embed"  # iframe 嵌入的 URL
navcolor: "invert"                   # 导航栏反色（浅色背景时使用）
---
```

---

## 包含组件 _includes

### head.html — HTML 头部

**功能：** 提供所有页面共享的 `<head>` 内容。

**包含内容一览：**

| 内容 | 说明 | 修改方法 |
|------|------|---------|
| `<meta charset>` | 字符编码 | 不要改 |
| `<meta viewport>` | 响应式视口 | 不要改 |
| `google-site-verification` | Google 搜索控制台验证 | 换自己的验证码 |
| `<meta description>` | SEO 描述 | 来自 `_config.yml` 的 `description` |
| `<meta keywords>` | SEO 关键词 | 来自 `_config.yml` 的 `keyword` |
| `<meta theme-color>` | Chrome 标签栏颜色 | 来自 `_config.yml` 的 `chrome-tab-theme-color` |
| `<title>` | 页面标题 | `文章标题 - SEOTitle` 或仅 `SEOTitle` |
| `<link rel="manifest">` | PWA Manifest | 指向 `pwa/manifest.json` |
| `<link rel="shortcut icon">` | 浏览器 favicon | 替换 `img/favicon.ico` |
| `<link rel="apple-touch-icon">` | iOS 主屏图标 | 替换 `img/apple-touch-icon.png` |
| Bootstrap CSS | 栅格系统 | CDN 或本地 `css/bootstrap.min.css` |
| hux-blog CSS | 主题样式 | `css/hux-blog.min.css`（Grunt 编译自 Less） |
| syntax.css | 代码高亮 | Rouge 语法着色主题 |
| dark-mode.css | 黑夜模式样式 | `css/dark-mode.css`（通过 `[data-theme="dark"]` 选择器覆盖亮色） |
| Font Awesome | 图标字体 | CDN 加载 v4.6.3 |
| MathJax | 数学公式渲染 | CDN 加载 v3.x，所有页面均加载 |

**⚠️ MathJax 在所有页面加载：** 即使文章没有数学公式，也会下载 ~200KB MathJax 库。如需按需加载，在 `head.html` 的 MathJax 脚本外包裹 `{% if page.mathjax %}`。

另外 `head.html` 最顶部还有一个**黑夜模式防闪烁脚本**，在 CSS 加载前根据 `localStorage` 或系统偏好设置 `data-theme` 属性，避免亮→暗的闪烁。

### nav.html — 顶部导航栏

**功能：** 响应式导航栏，自动生成导航链接。

**自动链接生成规则：** 遍历 `site.pages` 中所有包含 `title` 的页面，自动添加导航项。

**这意味着：**
- 只要页面 front matter 中有 `title: "xxx"`，就会出现在导航栏
- `404.html` 和 `offline.html` 没有 `title` → 不会出现在导航栏 ✓
- 导航项顺序 = 页面字母顺序（Jekyll 默认）

**修改指南：**

| 需求 | 方法 |
|------|------|
| 添加导航项 | 创建新页面，front matter 中加 `title: "导航名称"` |
| 隐藏某页面 | 去掉该页面 front matter 的 `title` |
| 修改导航栏品牌名 | `<a class="navbar-brand">` 中的 `{{ site.title }}` |
| 调整移动端菜单宽度 | `less/hux-blog.less` → `#huxblog_navbar .navbar-collapse` → `width: 170px` |
| 移除黑夜模式按钮 | 删除 `nav.html` 中 `<li>` 包裹的 `<button class="theme-toggle-btn">` 整个块 |

导航栏右侧有一个 🌙/☀️ **主题切换按钮**，点击后调用 `footer.html` 中的切换逻辑在亮色/暗色模式之间切换。

### footer.html — 页脚 + JS 加载

**功能：** 页脚版权信息 + 所有 JavaScript 脚本加载 + Service Worker 注册。

**脚本加载顺序（有依赖关系，不要随意调换）：**

```
0. 黑夜模式切换    → 主题切换 JS（先于 jQuery，不依赖任何库）
1. jQuery         → Bootstrap 依赖
2. Bootstrap      → 导航栏 collapse 等功能
3. hux-blog.min.js → 主题核心逻辑（表格、视频响应式、导航滚动）
4. Service Worker → PWA 离线缓存注册
5. async() 定义   → 异步加载工具函数
6. 各功能模块     → tagcloud / FastClick / 统计 / 侧边目录（按需异步加载）
```

**修改指南：**

| 需求 | 方法 |
|------|------|
| 修改版权文字 | `<p class="copyright">` 中的内容 |
| 关闭 Service Worker | `_config.yml` → `service-worker: false` |
| 更换统计代码 | 百度统计 / Google Analytics 区块（由 `_config.yml` 控制是否渲染） |
| 关闭 FastClick | 移除对应的 `<script>` 块 |
| 修改黑夜模式颜色 | 编辑 `css/dark-mode.css`（颜色变量说明见[黑夜模式](#黑夜模式)） |
| 修改切换图标 | `footer.html` 中 `updateIcon()` 函数的 `☀️` / `🌙` 文字 |

### social-icon.html — 社交图标组件

**功能：** 可复用的社交图标，生成 Font Awesome 圆形图标链接。

**调用方式：**

```liquid
{% include social-icon.html url="https://github.com/xxx" icon="github" external=true %}
{% include social-icon.html url="https://jianshu.com/u/xxx" text="简" external=true %}
```

**参数说明：**

| 参数 | 说明 | 示例值 |
|------|------|--------|
| `url` | 链接地址（必填） | `"https://github.com/xxx"` |
| `icon` | Font Awesome 4 图标名 | `"github"`, `"twitter"`, `"weibo"` |
| `text` | 自定义文字（无对应 FA 图标时用） | `"简"`, `"知"` |
| `external` | 是否新标签页打开 | `true` / `false` |

**icon 和 text 二选一：** 传了 `text` 就忽略 `icon`。

### anchor-js.html — 标题锚点

**功能：** 鼠标悬停在正文标题上时显示 `#` 链接图标，点击可复制锚点 URL。

**控制开关：** `_config.yml` → `anchorjs: true/false`

**注意：** `async()` 函数在此文件中重复定义了一次（与 `footer.html` 中相同），因为此组件可能在不加载 footer 的页面使用。两个定义功能相同，重复无害。

---

## 样式系统 Less

**源码目录：** `less/` | **编译输出：** `css/hux-blog.css` + `css/hux-blog.min.css`

### 文件职责

| 文件 | 职责 | 修改场景 |
|------|------|---------|
| `variables.less` | 颜色变量（品牌色、灰度、透明度） | 换主题色 |
| `mixins.less` | 可复用样式片段（字体栈、过渡动画、背景覆盖） | 换字体 |
| `hux-blog.less` | 主样式（排版、导航、首页、文章、标签、按钮、分页等） | 调整布局、间距、颜色 |
| `sidebar.less` | 侧边栏样式 | 修改侧边栏外观 |
| `side-catalog.less` | 侧边目录样式 | 修改目录外观 |

### 常用修改

| 需求 | 文件 | 修改内容 |
|------|------|---------|
| 换主题色 | `variables.less` | `@brand-primary: #0085A1` → 你的颜色 |
| 换正文字号 | `hux-blog.less` | `body { font-size: 16px }` |
| 换字体 | `mixins.less` | `.sans-serif()` 中的字体列表 |
| 调整导航栏高度 | `hux-blog.less` | `.navbar-custom.is-fixed { top: -61px }` |
| 修改首页卡片间距 | `hux-blog.less` | `.post-preview > a > .post-title { margin-* }` |

### 编译方法

```bash
# 安装依赖（仅首次）
npm install

# 编译 Less → CSS（同时生成展开版和压缩版）
grunt less

# 或监听文件变化自动编译
grunt watch
```

---

## JavaScript 脚本

### 核心脚本

| 文件 | 作用 | 依赖 |
|------|------|------|
| `jquery.js` | DOM 操作库 | 无 |
| `bootstrap.js` | UI 组件（导航栏 collapse 等） | jQuery |
| `hux-blog.js` | 主题核心逻辑 | jQuery + Bootstrap |
| `jquery.nav.js` | 单页导航（侧边目录滚动高亮） | jQuery |
| `jquery.tagcloud.js` | 标签云（字号/颜色按权重变化） | jQuery |
| `md5.min.js` | MD5 哈希（Gitalk 评论 ID 缩短） | 无 |

### hux-blog.js 功能清单

| 功能 | 位置 |
|------|------|
| 响应式表格（包裹 `.table-responsive`） | DOM 就绪时 |
| 响应式视频嵌入（YouTube / Vimeo） | DOM 就绪时 |
| 导航栏滚动显示/隐藏（大屏 ≥1170px） | scroll 事件 |
| 侧边目录固定定位 | scroll 事件 |

### jquery.tagcloud.js 配置

在 `_includes/footer.html` 中配置：

```javascript
$.fn.tagcloud.defaults = {
    // size: {start: 1, end: 1, unit: 'em'},   // 字号范围
    color: {start: '#bbbbee', end: '#0085a1'}, // 颜色渐变
};
```

### jquery.nav.js 配置

在 `_includes/footer.html` 的侧边目录初始化中配置：

```javascript
$('.catalog-body').onePageNav({
    currentClass: "active",      // 当前高亮项的 CSS 类
    scrollSpeed: 700,            // 平滑滚动速度（毫秒）
    scrollThreshold: .2,         // 滚动到 20% 时切换高亮
    padding: 80                  // 顶部偏移（防止固定导航栏遮挡标题）
});
```

---

## PWA 离线支持

### 工作原理

```
用户首次访问
  → 注册 Service Worker (sw.js)
  → 预缓存 offline.html
  → 后续请求走 Stale-while-revalidate 策略

用户离线访问
  → SW 拦截请求
  → 缓存命中 → 返回缓存内容
  → 缓存未命中 → 返回 offline.html
```

### 关键文件

| 文件 | 作用 |
|------|------|
| `sw.js` | Service Worker 核心逻辑 |
| `offline.html` | 离线兜底页面 |
| `pwa/manifest.json` | Web App Manifest（可安装到手机桌面） |
| `pwa/icons/` | PWA 图标（128px + 512px） |

### 控制开关

```yaml
# _config.yml
service-worker: true            # false = 关闭离线缓存
chrome-tab-theme-color: "#000000"  # 浏览器标签栏颜色
```

### 缓存策略

**Stale-while-revalidate（优先缓存，后台更新）：**

```
请求 → 查缓存 → 命中？→ 返回缓存 + 后台网络更新
                    ↓ 未命中
                  网络请求 → 成功？→ 返回 + 存入缓存
                              ↓ 失败
                            → 返回 offline.html
```

### 更新 SW 缓存

修改 `sw.js` 后，需更新版本号让浏览器重新安装：

```javascript
// sw.js 第 23 行附近
const PRECACHE = 'precache-v1';  // 改为 v2、v3...
```

---

## 构建工具 Grunt

### 功能

自动化编译 LESS → CSS、压缩 JS、添加版权横幅。

```bash
grunt           # 完整构建：uglify → less → usebanner
grunt uglify    # 仅压缩 JS
grunt less      # 仅编译 Less
grunt watch     # 监听文件变化自动编译
```

### 配置

| 配置项 | 文件 |
|--------|------|
| 插件依赖 | `package.json` → `devDependencies` |
| 任务配置 | `Gruntfile.js` |

---

## 评论系统

### Gitalk（推荐）

基于 GitHub Issues 的评论系统，无需第三方服务。

**启用步骤：**

1. 在 GitHub 创建 [OAuth Application](https://github.com/settings/applications/new)
   - Homepage URL: `https://yourname.github.io`
   - Authorization callback URL: `https://yourname.github.io`
2. 获取 `Client ID` 和 `Client Secret`
3. 在 `_config.yml` 中取消 Gitalk 注释并填入凭据
4. 将 `enable` 设为 `true`

**三个页面的 Gitalk 配置有差异：**

| 页面 | id（评论唯一标识） | distractionFreeMode |
|------|-------------------|---------------------|
| `post.html` | `md5(location.pathname)` | ✓（有） |
| `about.html` | `'about'` | ✓（有） |
| `keynote.html` | `window.location.pathname` | ✗（无） |

### Disqus

传统第三方评论服务。

**启用条件：** `_config.yml` → `disqus_username: your_shortname`

**⚠️ 注意：** Disqus 的配置引用在不同页面中不一致（见[已知问题](#已知问题与注意)），建议优先使用 Gitalk。

---

## 网站统计

### 百度统计

```yaml
# _config.yml
ba_track_id: 你的百度统计ID
```

脚本在 `_includes/footer.html` 中，只有设置了 `ba_track_id` 才会加载。

### Google Analytics

```yaml
# _config.yml
ga_track_id: 'UA-XXXXXXXXX-X'   # 旧版 Universal Analytics
# 或
ga_track_id: 'G-XXXXXXXXXX'     # GA4
ga_domain: auto
```

---

## 如何写文章

### 1. 创建文件

在 `_posts/` 目录下创建文件，命名格式：`YYYY-MM-DD-标题.md`

```
_posts/
  2026-07-01-新文章.md
  2026-06-15-另一篇.md
```

### 2. 填写 Front Matter

```yaml
---
layout: post
title: 文章标题
subtitle: 副标题（可选）
date: 2026-07-01
author: BYQ0002
header-img: img/xxx.jpg
header-mask: 0.3
catalog: true
mathjax: false
tags:
    - 标签1
    - 标签2
---
```

### 3. 写正文（Markdown）

```markdown
## 二级标题

正文内容，支持 **粗体**、*斜体*、`行内代码`。

### 三级标题

- 列表项 1
- 列表项 2

> 引用文字

![图片描述](图片路径)

[链接文字](https://example.com)
```

### 4. 代码高亮

````markdown
```python
def hello():
    print("Hello World")
```
````

Rouge 支持的语言列表：https://github.com/rouge-ruby/rouge/wiki/List-of-supported-languages-and-lexers

### 5. 数学公式

需在 front matter 设置 `mathjax: true`。

```
行内公式：$E = mc^2$

块级公式：
$$
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$
```

### 6. 图片路径

**推荐：** 图片放 `img/` 目录，文章中用相对路径：

```markdown
![图片](img/xxx.jpg)
```

**封面图：** 在 front matter 的 `header-img` 中指定，相对路径从站点根目录起：

```yaml
header-img: img/xxx.jpg
```

---

## 已知问题与注意

### ⚠️ 代码冲突 / 需要注意的问题

| 编号 | 严重度 | 问题 | 影响 | 状态 |
|------|--------|------|------|------|
| 1 | 🔴 | **Disqus 配置引用不一致**：`post.html` 检查 `site.disqus_username`（扁平），`keynote.html` 和 `about.html` 检查 `site.disqus.enable`（嵌套），但 `_config.yml` 只有被注释的 `disqus_username` | 即使配置了 Disqus，keynote 和 about 页的评论也不会生效 | ✅ 已修复 — 统一为 `site.disqus_username` |
| 2 | 🟡 | **页脚 GitHub 按钮失效**：`footer.html` 引用 `site.github_repo` 和 `site.github_username`，但两者在 `_config.yml` 中均被注释 | GitHub 星星按钮渲染为空白链接 | ✅ 已修复 — 填入 BYQ0002 实际值 |
| 3 | 🟡 | **MathJax 全局加载**：所有页面均加载 ~200KB MathJax 库，包括首页、标签页等无公式的页面 | 浪费带宽，拖慢首屏 | ✅ 已修复 — 改为 `{% if page.mathjax %}` 按需加载 |
| 4 | 🟡 | **async() 函数重复定义**：`anchor-js.html` 和 `footer.html` 各定义了一次相同的 `async()` 函数 | 无害（后加载的覆盖先加载的），但浪费字节 | 将 `async()` 提取为独立 JS 文件 |
| 5 | 🔵 | **Gruntfile 源文件引用已修复**：原 Gruntfile 使用 `<%= pkg.name %>`（→ `by-blog.*`）但实际文件名为 `hux-blog.*` | 已在本次优化中修复 | — |
| 6 | 🔵 | **sw.js skipWaiting() 时序 bug 已修复**：原代码在事件注册时立即调用 `skipWaiting()` 而非缓存完成后 | 已在本次优化中修复 | — |
| 7 | 🔵 | **jquery.tagcloud.js 全局变量泄漏已修复**：`tagWeights`、`lowest`、`hex` 等 10 个变量未声明直接赋值到全局 | 已在本次优化中修复 | — |
| 8 | 🔵 | **about.html 语言切换 JS 报错已修复**：脚本引用的 DOM 元素全被注释，运行时抛 TypeError | 已在本次优化中移除 | — |

### 💡 优化建议

| 建议 | 说明 |
|------|------|
| **Grunt 插件升级** | 所有 Grunt 插件为 `~0.x` 版本（2014-2015），存在已知安全漏洞。建议升级或迁移到 Webpack/Vite |
| **代码分割 MathJax** | 全局 MathJax 加载改用按需加载（`{% if page.mathjax %}`），减少 80% 页面的 JS 体积 |
| **统一 Disqus 配置** | 三个页面的 Disqus 条件判断不一致，统一后可正常使用 Disqus 评论 |
| **删除废弃脚本** | `.travis.yml` 中 Codecov 上传命令、`package.json` 中 `cafe` 脚本（GitCafe 已关闭）可安全移除 |
| **Git 历史清理** | `codecov.yml` 中的 token 已暴露在 Git 历史中，建议在 Codecov 后台吊销并重新生成 |

---

## 附录：常用链接

| 资源 | 链接 |
|------|------|
| Jekyll 文档 | https://jekyllrb.com/docs/ |
| Liquid 模板语法 | https://shopify.github.io/liquid/ |
| GitHub Pages 文档 | https://docs.github.com/en/pages |
| Font Awesome 4 图标 | https://fontawesome.com/v4/icons/ |
| Markdown 语法 | https://www.markdownguide.org/ |
| anchor-js | http://bryanbraun.github.io/anchorjs/ |
| Gitalk | https://github.com/gitalk/gitalk |
---


> 📝 本指南基于仓库完整扫描生成，覆盖所有功能点。如有新增功能，请同步更新此文档。
