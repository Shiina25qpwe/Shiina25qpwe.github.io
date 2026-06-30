/*!
 * ============================================================
 * jQuery One Page Nav Plugin v3.0.0
 * ============================================================
 * 
 * 原作者: Trevor Davis (http://trevordavis.net)
 * 仓库:   http://github.com/davist11/jQuery-One-Page-Nav
 * 许可:   MIT / GPL
 *
 * 功能: 监听页面滚动, 自动高亮当前所在的导航项 (类似 Bootstrap ScrollSpy)。
 *       点击导航项时平滑滚动到对应章节。
 *
 * Hux 自定义: 添加 padding 参数 (偏移量), 用于补偿固定导航栏高度,
 *             防止滚动后标题被遮挡。
 *
 * 在 footer.html 中的调用示例:
 *   $('.catalog-body').onePageNav({
 *       currentClass: 'active',
 *       changeHash: false,
 *       scrollSpeed: 700,
 *       scrollThreshold: 0.2,
 *       padding: 80
 *   });
 *
 * ── 参数说明 ──
 *   navItems        : 导航项选择器 (默认 'a')
 *                     插件从容器中查找此选择器作为导航链接
 *   currentClass    : 当前项的 CSS 类名 (默认 'current')
 *                     滚动到对应章节时, 给对应的 <li> 添加此类
 *   changeHash      : 是否修改浏览器 URL hash (默认 false)
 *                     true → 点击跳转时更新地址栏 #section-id
 *   easing          : 滚动动画缓动函数 (默认 'swing')
 *                     'swing' = jQuery 默认, 'linear' = 匀速
 *   filter          : 导航项过滤器 (默认 '')
 *                     ':not(.external)' → 排除特定链接
 *   scrollSpeed     : 滚动动画持续时间, 毫秒 (默认 750)
 *   scrollOffset    : 滚动目标偏移量, 像素 (默认 0)
 *                     与 padding 类似但作用于计算阶段
 *   scrollThreshold : 触发切换的视口比例 (默认 0.5)
 *                     0.2 → 章节进入视口 20% 时高亮其导航项
 *   begin           : 滚动开始回调函数 (默认 false)
 *   end             : 滚动结束回调函数 (默认 false)
 *   scrollChange    : 导航项切换回调函数, 参数为当前 $parent (默认 false)
 *   padding         : Hux 自定义 — 目标位置向上偏移, 像素 (默认 0)
 *                     解决固定导航栏遮挡章节标题的问题
 */

;(function($, window, document, undefined){

	/**
	 * OnePageNav 构造函数
	 * @param {Element} elem    - 导航容器 DOM 元素
	 * @param {Object}  options - 用户配置选项
	 */
	var OnePageNav = function(elem, options){
		this.elem = elem;
		this.$elem = $(elem);
		this.options = options;
		this.metadata = this.$elem.data('plugin-options');  // HTML data 属性中的配置
		this.$win = $(window);
		this.sections = {};       // 章节位置缓存 { 'section-id': offsetTop }
		this.didScroll = false;   // 滚动标记 (用于节流)
		this.$doc = $(document);
		this.docHeight = this.$doc.height();
	};

	// 原型方法
	OnePageNav.prototype = {
		/**
		 * 默认配置 (可被用户 options 和 data-plugin-options 覆盖)
		 * 合并优先级: defaults < options < metadata
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
			padding: 0         // Hux 自定义参数
		},

		/**
		 * init() - 初始化插件
		 * 1. 合并配置
		 * 2. 绑定点击事件
		 * 3. 获取章节位置
		 * 4. 启动滚动监听
		 * 5. 绑定窗口 resize 事件 (重新计算章节位置)
		 */
		init: function() {
			this.config = $.extend({}, this.defaults, this.options, this.metadata);
			this.$nav = this.$elem.find(this.config.navItems);

			// 过滤导航项
			if(this.config.filter !== '') {
				this.$nav = this.$nav.filter(this.config.filter);
			}

			// 绑定点击: 使用 $.proxy 保持 this 指向 OnePageNav 实例
			this.$nav.on('click.onePageNav', $.proxy(this.handleClick, this));

			this.getPositions();       // 计算所有章节位置
			this.bindInterval();       // 启动 250ms 轮询检测滚动
			this.$win.on('resize.onePageNav', $.proxy(this.getPositions, this));

			return this;
		},

		/**
		 * adjustNav(self, $parent) - 切换高亮导航项
		 * 移除所有导航项的 currentClass, 仅添加到当前项
		 */
		adjustNav: function(self, $parent) {
			self.$elem.find('.' + self.config.currentClass).removeClass(self.config.currentClass);
			$parent.addClass(self.config.currentClass);
		},

		/**
		 * bindInterval() - 启动滚动轮询 (每 250ms)
		 * 
		 * 为什么用 setInterval 而非 scroll 事件?
		 *   scroll 事件触发频率极高 (每帧都可能触发), 使用轮询可以:
		 *   1. 节流 (throttle) — 最多每秒 4 次回调
		 *   2. 配合 didScroll 标记避免重复计算
		 * 
		 * 同时检测文档高度变化 (动态加载内容导致高度改变时重算位置)
		 */
		bindInterval: function() {
			var self = this;
			var docHeight;

			self.$win.on('scroll.onePageNav', function() {
				self.didScroll = true;    // 标记: 发生了滚动
			});

			self.t = setInterval(function() {
				docHeight = self.$doc.height();

				if(self.didScroll) {
					self.didScroll = false;
					self.scrollChange();  // 处理滚动 → 切换高亮
				}

				// 文档高度变化 (如 AJAX 加载内容) → 重新计算章节位置
				if(docHeight !== self.docHeight) {
					self.docHeight = docHeight;
					self.getPositions();
				}
			}, 250);
		},

		/**
		 * getHash($link) - 从链接 href 中提取 hash (去掉 #)
		 * '/page#section-id' → 'section-id'
		 */
		getHash: function($link) {
			return $link.attr('href').split('#')[1];
		},

		/**
		 * getPositions() - 计算所有目标章节的 offsetTop
		 * 遍历导航链接 → 通过 href hash 找到对应元素 → 记录其位置
		 */
		getPositions: function() {
			var self = this;
			var linkHref;
			var topPos;
			var $target;

			self.$nav.each(function() {
				linkHref = self.getHash($(this));
				$target = $('#' + linkHref);

				if($target.length) {
					topPos = $target.offset().top;
					self.sections[linkHref] = Math.round(topPos);
				}
			});
		},

		/**
		 * getSection(windowPos) - 根据滚动位置确定当前章节
		 * 
		 * @param {number} windowPos - 当前 window.scrollTop
		 * @returns {string|null} 章节 ID (无 #) 或 null
		 * 
		 * 逻辑: 遍历所有章节, 找到最后一个 "顶部已进入视口阈值" 的章节
		 * 
		 * scrollThreshold 的作用:
		 *   threshold=0.5 → 章节需要进入视口 50% 才算"到达"
		 *   实际上: 章节顶部超过 (视口顶部 + 视口高度*threshold) 才算离开
		 */
		getSection: function(windowPos) {
			var returnValue = null;
			var windowHeight = Math.round(this.$win.height() * this.config.scrollThreshold);

			for(var section in this.sections) {
				if((this.sections[section] - windowHeight) < windowPos) {
					returnValue = section;
				}
			}

			return returnValue;
		},

		/**
		 * handleClick(e) - 处理导航项点击
		 * 
		 * 流程:
		 *   1. 如果点击的不是当前高亮项 → 执行跳转
		 *   2. 调用 begin 回调
		 *   3. 手动高亮目标项
		 *   4. 暂停自动滚动检测 (防止动画期间误切换)
		 *   5. 平滑滚动到目标章节
		 *   6. 滚动完成后可选修改 URL hash
		 *   7. 恢复自动滚动检测
		 *   8. 调用 end 回调
		 */
		handleClick: function(e) {
			var self = this;
			var $link = $(e.currentTarget);
			var $parent = $link.parent();
			var newLoc = '#' + self.getHash($link);

			if(!$parent.hasClass(self.config.currentClass)) {
				if(self.config.begin) {
					self.config.begin();
				}

				self.adjustNav(self, $parent);

				// 暂停自动检测 → 防止动画期间 scrollChange 误切换
				self.unbindInterval();

				self.scrollTo(newLoc, function() {
					if(self.config.changeHash) {
						window.location.hash = newLoc;
					}

					// 恢复自动检测
					self.bindInterval();

					if(self.config.end) {
						self.config.end();
					}
				});
			}

			e.preventDefault();
		},

		/**
		 * scrollChange() - 滚动时自动切换高亮导航项
		 * 由 bindInterval 的 setInterval 每 250ms 调用
		 */
		scrollChange: function() {
			var windowTop = this.$win.scrollTop();
			var position = this.getSection(windowTop);
			var $parent;

			if(position !== null) {
				// 通过 'href$="#sectionId"' 选择器找到对应导航项
				$parent = this.$elem.find('a[href$="#' + position + '"]').parent();

				if(!$parent.hasClass(this.config.currentClass)) {
					this.adjustNav(this, $parent);

					if(this.config.scrollChange) {
						this.config.scrollChange($parent);
					}
				}
			}
		},

		/**
		 * scrollTo(target, callback) - 平滑滚动到目标章节
		 * 
		 * @param {string}   target   - CSS 选择器, 如 '#section-id'
		 * @param {Function} callback - 滚动完成后执行
		 * 
		 * 使用 jQuery.animate 平滑滚动 html,body,
		 * 滚动距离 = target.offsetTop - padding (Hux 自定义偏移)
		 */
		scrollTo: function(target, callback) {
			var offset = $(target).offset().top - this.config.padding;

			$('html, body').animate({
				scrollTop: offset
			}, this.config.scrollSpeed, this.config.easing, callback);
		},

		/**
		 * unbindInterval() - 停止自动滚动检测
		 * 清除 setInterval 并解绑 scroll 事件 (点击跳转时临时暂停)
		 */
		unbindInterval: function() {
			clearInterval(this.t);
			this.$win.unbind('scroll.onePageNav');
		}
	};

	// 静态默认值 (允许全局修改: $.fn.onePageNav.defaults.xxx = yyy)
	OnePageNav.defaults = OnePageNav.prototype.defaults;

	/**
	 * $.fn.onePageNav(options) - jQuery 插件入口
	 * 支持多个元素: $('.nav1, .nav2').onePageNav({...})
	 */
	$.fn.onePageNav = function(options) {
		return this.each(function() {
			new OnePageNav(this, options).init();
		});
	};

})( jQuery, window , document );
