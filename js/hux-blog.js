/*!
 * ============================================================
 * hux-blog.js - Hux Blog 主题自定义脚本
 * ============================================================
 * 
 * 基于 Start Bootstrap Clean Blog v1.0.0 修改
 * 原作者: Start Bootstrap (http://startbootstrap.com)
 * 修改者: @huxpro (2016)
 * 许可: Apache 2.0
 *
 * 功能模块:
 *   1. 响应式表格    — 为 <table> 添加 Bootstrap 响应式包装
 *   2. 响应式视频    — 为 YouTube/Vimeo iframe 添加 16:9 响应式容器
 *   3. 导航栏滚动    — 向下滚动隐藏/向上滚动显示 + 滚动位置固定
 *   4. 侧边目录定位  — 滚动时切换 .side-catalog 的 fixed 状态
 */

/* 
 * ============================================================
 * 1. 响应式表格 (Responsive Tables)
 * ============================================================
 * 为文章中的 <table> 自动添加 Bootstrap .table-responsive 包装器,
 * 使宽表格在小屏上可横向滚动。
 */
$(document).ready(function() {
    // 用 .table-responsive div 包裹表格（超出时出现横向滚动条）
    $("table").wrap("<div class='table-responsive'></div>");
    // 添加 Bootstrap .table 类（基础表格样式: 边框/间距/条纹）
    $("table").addClass("table");
});

/* 
 * ============================================================
 * 2. 响应式嵌入视频 (Responsive Embed Videos)
 * ============================================================
 * 自动检测 YouTube/Vimeo iframe, 包裹 Bootstrap 响应式容器,
 * 使视频在移动端保持 16:9 比例自适应。
 * 
 * 选择器策略:
 *   $('iframe[src*="youtube.com"]') → 匹配 src 包含 "youtube.com" 的 iframe
 *   (注意: 此选择器非正则, 是 CSS3 属性子串匹配)
 * 
 * .embed-responsive-16by9 : Bootstrap 类, 通过 padding-bottom: 56.25% 实现 16:9
 * .embed-responsive-item  : Bootstrap 类, 使 iframe 填满父容器
 */
$(document).ready(function() {
    $('iframe[src*="youtube.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>');
    $('iframe[src*="youtube.com"]').addClass('embed-responsive-item');
    $('iframe[src*="vimeo.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>');
    $('iframe[src*="vimeo.com"]').addClass('embed-responsive-item');
});

/* 
 * ============================================================
 * 3 & 4. 导航栏滚动 + 侧边目录定位 (Scroll Behavior)
 * ============================================================
 * 
 * 【导航栏行为】(仅大屏 ≥1170px)
 *   - 向下滚动超过头部高度 → 导航栏固定顶部 (.is-fixed)
 *   - 向上滚动 → 导航栏滑入显示 (.is-visible)
 *   - 向下滚动 → 导航栏滑出隐藏 (移除 .is-visible)
 *   - 滚动回顶部 → 导航栏恢复绝对定位 (移除 .is-fixed)
 * 
 *   CSS 过渡动画在 hux-blog.css 第 5 段 (.navbar-custom) 定义。
 * 
 * 【侧边目录行为】
 *   - 滚动超过头部 + 41px → 目录固定定位 (.fixed)
 *   - 滚动回上方 → 目录恢复静态定位
 * 
 * 关键变量:
 *   MQL           : 1170px — 最小大屏宽度阈值 (与 Bootstrap lg 断点对应)
 *   headerHeight  : 导航栏自身高度 (用于判断何时固定)
 *   bannerHeight  : 头部背景图区域高度 (用于判断是否滚出头部)
 *   previousTop   : 上一次滚动位置 (判断滚动方向: 上/下)
 *   +41           : 导航栏固定后占用 61px, offset 补偿后留 41px 空白
 */
jQuery(document).ready(function($) {
    var MQL = 1170;

    // 仅在大屏 (≥1170px) 启用滚动行为
    if ($(window).width() > MQL) {
        var headerHeight = $('.navbar-custom').height(),       // 导航栏高度
            bannerHeight  = $('.intro-header .container').height();  // 头部内容高度

        $(window).on('scroll', {
                previousTop: 0      // 初始滚动位置
            },
            function() {
                var currentTop = $(window).scrollTop(),    // 当前滚动位置
                    $catalog = $('.side-catalog');         // 侧边目录元素

                // ── 判断滚动方向 ──
                if (currentTop < this.previousTop) {
                    // 向上滚动: 显示导航栏
                    if (currentTop > 0 && $('.navbar-custom').hasClass('is-fixed')) {
                        $('.navbar-custom').addClass('is-visible');
                    } else {
                        // 已回到顶部: 移除所有固定/显示类
                        $('.navbar-custom').removeClass('is-visible is-fixed');
                    }
                } else {
                    // 向下滚动: 隐藏导航栏
                    $('.navbar-custom').removeClass('is-visible');
                    // 滚出头部区域后固定导航栏
                    if (currentTop > headerHeight && !$('.navbar-custom').hasClass('is-fixed')) {
                        $('.navbar-custom').addClass('is-fixed');
                    }
                }
                this.previousTop = currentTop;  // 更新上一次位置

                // ── 侧边目录 fixed 定位 ──
                $catalog.show();
                if (currentTop > (bannerHeight + 41)) {
                    $catalog.addClass('fixed');
                } else {
                    $catalog.removeClass('fixed');
                }
            });
    }
});
