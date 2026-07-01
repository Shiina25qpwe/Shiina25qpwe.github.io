/*
 * jQuery One Page Nav Plugin
 * http://github.com/davist11/jQuery-One-Page-Nav
 *
 * Copyright (c) 2010 Trevor Davis (http://trevordavis.net)
 * Dual licensed under the MIT and GPL licenses.
 * Uses the same license as jQuery, see:
 * http://jquery.org/license
 *
 * @version 3.0.0
 *
 * 用法示例：
 * $('#nav').onePageNav({
 *   currentClass: 'current',   // 当前高亮项的 CSS 类名
 *   changeHash: false,         // 是否更新浏览器地址栏 hash
 *   scrollSpeed: 750           // 滚动动画速度（毫秒）
 * });
 *
 * 优化说明：
 * - 移除 bindInterval() 中多余的 docHeight 外部声明变量
 * - 添加中文注释，标注每个配置参数和方法的含义
 */

;(function ($, window, document, undefined) {

    /**
     * OnePageNav 构造函数
     *
     * @param {Element} elem    - 导航栏 DOM 元素
     * @param {Object}  options - 用户传入的配置项
     */
    var OnePageNav = function (elem, options) {
        this.elem = elem;                          // 原始 DOM 元素
        this.$elem = $(elem);                      // jQuery 包装的导航栏元素
        this.options = options;                    // 用户配置
        this.metadata = this.$elem.data('plugin-options'); // data 属性中的配置
        this.$win = $(window);                     // window 的 jQuery 引用
        this.sections = {};                        // 存储各锚点对应区域的顶部偏移量 {hash: topPos}
        this.didScroll = false;                    // 滚动标记（节流用）
        this.$doc = $(document);                   // document 的 jQuery 引用
        this.docHeight = this.$doc.height();        // 文档初始高度
    };

    // ============================================================
    // 原型方法
    // ============================================================
    OnePageNav.prototype = {

        /**
         * 默认配置项
         *
         * @property {string}  navItems        - 导航项的选择器（默认 "a"）
         * @property {string}  currentClass    - 当前高亮项的 CSS 类名
         * @property {boolean} changeHash      - 点击导航时是否更新 URL hash
         * @property {string}  easing          - 滚动动画的缓动函数（默认 "swing"）
         * @property {string}  filter          - 用于过滤导航项的额外选择器
         * @property {number}  scrollSpeed     - 滚动动画持续时间（毫秒，默认 750）
         * @property {number}  scrollThreshold - 判断当前区域的阈值比例（0-1，默认 0.5）
         * @property {Function} begin          - 开始滚动时的回调函数
         * @property {Function} end            - 滚动完成后的回调函数
         * @property {Function} scrollChange   - 滚动切换区域时的回调函数，参数为当前高亮的导航父元素
         * @property {number}  padding         - 滚动目标位置的上方内边距（px，默认 0）
         */
        defaults: {
            navItems: 'a',
            currentClass: 'current',
            changeHash: false,
            easing: 'swing',
            filter: '',
            scrollSpeed: 750,
            scrollThreshold: 0.5,
            begin: false,
            end: false,
            scrollChange: false,
            padding: 0
        },

        /**
         * 初始化插件
         * - 合并配置
         * - 绑定导航点击事件
         * - 计算各区域位置
         * - 绑定滚动监听
         * - 绑定窗口大小变化时重新计算位置
         */
        init: function () {
            // 合并默认配置、用户配置和 data 属性配置（后者优先级更高）
            this.config = $.extend({}, this.defaults, this.options, this.metadata);

            // 获取导航项元素列表
            this.$nav = this.$elem.find(this.config.navItems);

            // 按 filter 过滤导航项
            if (this.config.filter !== '') {
                this.$nav = this.$nav.filter(this.config.filter);
            }

            // 绑定导航点击事件，使用 $.proxy 保持 this 上下文
            this.$nav.on('click.onePageNav', $.proxy(this.handleClick, this));

            // 计算各锚点对应区域的顶部偏移量
            this.getPositions();

            // 启动滚动监听（节流方式）
            this.bindInterval();

            // 窗口大小变化时重新计算区域位置
            this.$win.on('resize.onePageNav', $.proxy(this.getPositions, this));

            return this;
        },

        /**
         * 高亮当前导航项
         *
         * @param {Object} self   - 插件实例
         * @param {jQuery} $parent - 要高亮的导航项的父元素
         */
        adjustNav: function (self, $parent) {
            self.$elem.find('.' + self.config.currentClass).removeClass(self.config.currentClass);
            $parent.addClass(self.config.currentClass);
        },

        /**
         * 启动滚动监听（使用 setInterval 实现滚动节流）
         * 每 250ms 检查一次是否发生滚动或文档高度变化
         */
        bindInterval: function () {
            var self = this;

            // 标记"发生过滚动"
            self.$win.on('scroll.onePageNav', function () {
                self.didScroll = true;
            });

            // 每 250ms 定时检查
            self.t = setInterval(function () {
                var docHeight = self.$doc.height();  // 当前文档高度

                // 如果发生了滚动，更新导航高亮
                if (self.didScroll) {
                    self.didScroll = false;
                    self.scrollChange();
                }

                // 如果文档高度发生变化（如动态加载内容），重新计算区域位置
                if (docHeight !== self.docHeight) {
                    self.docHeight = docHeight;
                    self.getPositions();
                }
            }, 250);
        },

        /**
         * 从链接的 href 中提取 hash 值
         *
         * @param {jQuery} $link - 链接元素
         * @returns {string}     hash 字符串（不含 # 号），如 "section1"
         */
        getHash: function ($link) {
            return $link.attr('href').split('#')[1];
        },

        /**
         * 计算所有锚点区域的顶部偏移量，存入 this.sections
         * sections 结构：{ "section1": 500, "section2": 1200, ... }
         */
        getPositions: function () {
            var self = this;

            self.$nav.each(function () {
                var linkHref = self.getHash($(this));       // 提取 hash
                var $target = $('#' + linkHref);             // 对应的目标区域元素

                if ($target.length) {
                    var topPos = $target.offset().top;        // 目标区域顶部坐标
                    self.sections[linkHref] = Math.round(topPos);
                }
            });
        },

        /**
         * 根据窗口滚动位置判断当前处于哪个区域
         *
         * @param {number} windowPos - 当前窗口滚动距离（scrollTop）
         * @returns {string|null}    当前区域的 hash 值，或 null
         */
        getSection: function (windowPos) {
            var returnValue = null;
            var windowHeight = Math.round(this.$win.height() * this.config.scrollThreshold);

            // 遍历所有区域，找到最后一个顶部偏移量小于"窗口位置+阈值高度"的区域
            for (var section in this.sections) {
                if (this.sections.hasOwnProperty(section)) {
                    if ((this.sections[section] - windowHeight) < windowPos) {
                        returnValue = section;
                    }
                }
            }

            return returnValue;
        },

        /**
         * 处理导航链接点击事件
         * - 高亮点击的导航项
         * - 暂停自动滚动监听
         * - 平滑滚动到目标区域
         * - 恢复自动滚动监听
         *
         * @param {Event} e - jQuery 点击事件对象
         */
        handleClick: function (e) {
            var self = this;
            var $link = $(e.currentTarget);          // 被点击的链接
            var $parent = $link.parent();            // 链接的父元素（通常 <li>）
            var newLoc = '#' + self.getHash($link);  // 目标位置选择器

            if (!$parent.hasClass(self.config.currentClass)) {
                // 触发 begin 回调
                if (self.config.begin) {
                    self.config.begin();
                }

                // 高亮当前导航项
                self.adjustNav(self, $parent);

                // 暂停自动滚动监听，避免手动滚动时触发自动高亮冲突
                self.unbindInterval();

                // 平滑滚动到目标位置
                self.scrollTo(newLoc, function () {
                    // 如果配置了 changeHash，更新地址栏 hash
                    if (self.config.changeHash) {
                        window.location.hash = newLoc;
                    }

                    // 恢复自动滚动监听
                    self.bindInterval();

                    // 触发 end 回调
                    if (self.config.end) {
                        self.config.end();
                    }
                });
            }

            e.preventDefault();  // 阻止默认的锚点跳转行为
        },

        /**
         * 滚动事件处理：检测当前区域并更新导航高亮
         */
        scrollChange: function () {
            var windowTop = this.$win.scrollTop();           // 当前滚动距离
            var position = this.getSection(windowTop);       // 判断当前区域
            var $parent;

            // 如果确定当前处于某个区域
            if (position !== null) {
                $parent = this.$elem.find('a[href$="#' + position + '"]').parent();

                // 如果该区域还未高亮，则更新高亮
                if (!$parent.hasClass(this.config.currentClass)) {
                    this.adjustNav(this, $parent);

                    // 触发 scrollChange 回调
                    if (this.config.scrollChange) {
                        this.config.scrollChange($parent);
                    }
                }
            }
        },

        /**
         * 平滑滚动到目标位置
         *
         * @param {string}   target   - 目标元素选择器（如 "#section1"）
         * @param {Function} callback - 滚动完成后的回调函数
         */
        scrollTo: function (target, callback) {
            // 目标位置的顶部坐标减去 padding 内边距
            var offset = $(target).offset().top - this.config.padding;

            $('html, body').animate({
                scrollTop: offset
            }, this.config.scrollSpeed, this.config.easing, callback);
        },

        /**
         * 停止自动滚动监听，清除定时器和 scroll 事件绑定
         */
        unbindInterval: function () {
            clearInterval(this.t);
            this.$win.unbind('scroll.onePageNav');
        }
    };

    // 将默认配置挂载到构造函数上，方便外部访问
    OnePageNav.defaults = OnePageNav.prototype.defaults;

    /**
     * jQuery 插件入口
     *
     * @param {Object} options - 配置项（参见 defaults）
     * @returns {jQuery}       返回自身以支持链式调用
     */
    $.fn.onePageNav = function (options) {
        return this.each(function () {
            new OnePageNav(this, options).init();
        });
    };

})(jQuery, window, document);
