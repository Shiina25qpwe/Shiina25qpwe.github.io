/*!
 * Clean Blog v1.0.0 (http://startbootstrap.com)
 * Copyright 2015 Start Bootstrap
 * Licensed under Apache 2.0 (https://github.com/IronSummitMedia/startbootstrap/blob/gh-pages/LICENSE)
 */

/*!
 * Hux Blog v1.6.0 (http://startbootstrap.com)
 * Copyright 2016 @huxpro
 * Licensed under Apache 2.0
 *
 * 优化说明：
 * - 移除已注释的死代码（tooltip、img-responsive）
 * - 合并两个 $(document).ready() 为一个，减少DOM就绪事件绑定
 * - 合并重复的jQuery选择器查询，链式调用提升性能
 * - 用闭包变量替代 scroll 事件的 data 参数，代码更清晰
 * - 添加中文注释，标注每个功能和参数含义
 */

// ============================================================
// DOM 就绪后统一初始化
// ============================================================
$(document).ready(function () {

    // ---------- 响应式表格 ----------
    // 为所有 <table> 包裹一个 .table-responsive 容器，并添加 Bootstrap 的 .table 类
    // 使表格在移动端可以水平滚动
    $("table")
        .wrap("<div class='table-responsive'></div>")
        .addClass("table");

    // ---------- 响应式视频嵌入 ----------
    // 为 YouTube 和 Vimeo 的 iframe 视频包裹 16:9 响应式容器
    // 并添加 .embed-responsive-item 类以启用 Bootstrap 的响应式嵌入

    // YouTube 视频
    $('iframe[src*="youtube.com"]')
        .wrap('<div class="embed-responsive embed-responsive-16by9"></div>')
        .addClass('embed-responsive-item');

    // Vimeo 视频
    $('iframe[src*="vimeo.com"]')
        .wrap('<div class="embed-responsive embed-responsive-16by9"></div>')
        .addClass('embed-responsive-item');
});

// ============================================================
// 导航栏：向下滚动隐藏，向上滚动显示
// ============================================================
jQuery(document).ready(function ($) {
    // MQL（Min Query Limit）：响应式断点宽度，小于此值不启用滚动效果
    var MQL = 1170;

    // 仅在大屏幕（宽度 > 1170px）时启用导航栏滚动显示/隐藏效果
    if ($(window).width() <= MQL) {
        return;
    }

    // 缓存关键DOM元素和尺寸值，避免滚动时反复查询
    var $navbar = $('.navbar-custom');              // 顶部导航栏
    var $sideCatalog = $('.side-catalog');           // 侧边目录
    var headerHeight = $navbar.height();             // 导航栏高度（px）
    var bannerHeight = $('.intro-header .container').height(); // 首页横幅高度（px）

    // 记录上一次滚动位置，用于判断滚动方向
    var previousTop = 0;

    $(window).on('scroll', function () {
        var currentTop = $(window).scrollTop();     // 当前页面滚动距离（px）

        // ------ 根据滚动方向控制导航栏的显示/隐藏 ------
        if (currentTop < previousTop) {
            // 向上滚动：显示导航栏
            if (currentTop > 0 && $navbar.hasClass('is-fixed')) {
                $navbar.addClass('is-visible');
            } else {
                $navbar.removeClass('is-visible is-fixed');
            }
        } else {
            // 向下滚动：隐藏导航栏
            $navbar.removeClass('is-visible');
            // 滚动超过导航栏高度后，固定导航栏到顶部
            if (currentTop > headerHeight && !$navbar.hasClass('is-fixed')) {
                $navbar.addClass('is-fixed');
            }
        }

        // 更新上一次滚动位置
        previousTop = currentTop;

        // ------ 控制侧边目录的固定定位 ------
        // 当滚动超过首页横幅 + 41px 偏移时，将侧边目录固定在屏幕右侧
        $sideCatalog.show();
        if (currentTop > (bannerHeight + 41)) {
            $sideCatalog.addClass('fixed');
        } else {
            $sideCatalog.removeClass('fixed');
        }
    });
});
