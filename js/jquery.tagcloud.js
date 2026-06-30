/*!
 * ============================================================
 * jquery.tagcloud.js - 标签云 jQuery 插件
 * ============================================================
 *
 * 来源: https://github.com/addywaddy/jquery.tagcloud.js
 * Hux 修改: 将 color 效果改为 backgroundColor (背景色而非文字色)
 *
 * 算法原理:
 *   1. 读取每个标签的 rel 属性作为权重值
 *   2. 对权重排序, 找到最小/最大值, 计算 range
 *   3. 根据 range 计算字体大小增量 (fontIncr) 或颜色增量 (colorIncr)
 *   4. 每个标签根据其权重在 [start, end] 范围内插值计算最终样式
 *
 * 调用方式:
 *   $('#tag_cloud a').tagcloud({
 *       size:  {start: 14, end: 18, unit: 'pt'},
 *       color: {start: '#bbbbee', end: '#0085a1'}
 *   });
 *
 * front-matter 配合:
 *   标签的 rel 属性在 Liquid 模板中由 {{ tag[1].size }} 填充,
 *   代表该标签下的文章数, 作为权重值.
 */

(function($) {

  /**
   * $.fn.tagcloud(options)
   *
   * @param {Object} options - 配置对象
   *   options.size  : {start, end, unit}  字体大小范围
   *   options.color : {start, end}        颜色范围 (十六进制, 如 '#bbbbee')
   *
   * 依赖: 每个标签元素需设置 rel 属性为数字权重值
   */
  $.fn.tagcloud = function(options) {
    // 合并默认配置和用户选项
    var opts = $.extend({}, $.fn.tagcloud.defaults, options);

    // 提取所有标签的 rel 属性值 (权重)
    var tagWeights = this.map(function(){
      return $(this).attr("rel");
    });
    // 转换为数组并升序排序
    tagWeights = jQuery.makeArray(tagWeights).sort(compareWeights);

    // 计算权重范围
    var lowest = tagWeights[0];           // 最小权重
    var highest = tagWeights.pop();       // 最大权重 (pop 移除最后一个元素)
    var range = highest - lowest;         // 权重跨度
    if(range === 0) { range = 1; }       // 防止除以零 (所有权重相同)

    // 计算字体大小增量
    var fontIncr;
    if (opts.size) {
      fontIncr = (opts.size.end - opts.size.start) / range;
    }

    // 计算颜色增量 (返回 RGB 数组, 如 [5, -12, 3])
    var colorIncr;
    if (opts.color) {
      colorIncr = colorIncrement(opts.color, range);
    }

    // 为每个标签设置样式
    return this.each(function() {
      var weighting = $(this).attr("rel") - lowest;  // 当前权重距最低值的偏移
      if (opts.size) {
        $(this).css({
          "font-size": opts.size.start + (weighting * fontIncr) + opts.size.unit
        });
      }
      if (opts.color) {
        // Hux 修改: 改为设置背景色 (原版设置文字色)
        $(this).css({
          "backgroundColor": tagColor(opts.color, colorIncr, weighting)
        });
      }
    });
  };

  // 默认配置 (仅 size, 无 color — 由调用方按需传入)
  $.fn.tagcloud.defaults = {
    size: {start: 14, end: 18, unit: "pt"}
  };

  /**
   * toRGB(code) - 十六进制颜色 → RGB 数组
   * @param {string} code - 如 '#f80' 或 '#ff8800'
   * @returns {number[]} 如 [255, 136, 0]
   */
  function toRGB (code) {
    if (code.length == 4) {
      // 短格式 #RGB → #RRGGBB (每个字符重复一次)
      code = jQuery.map(/\w+/.exec(code), function(el) {return el + el; }).join("");
    }
    var hex = /(\w{2})(\w{2})(\w{2})/.exec(code);
    return [parseInt(hex[1], 16), parseInt(hex[2], 16), parseInt(hex[3], 16)];
  }

  /**
   * toHex(ary) - RGB 数组 → 十六进制颜色
   * @param {number[]} ary - 如 [255, 136, 0]
   * @returns {string} 如 '#ff8800'
   */
  function toHex (ary) {
    return "#" + jQuery.map(ary, function(i) {
      var hex = i.toString(16);
      hex = (hex.length == 1) ? "0" + hex : hex;  // 个位数补零
      return hex;
    }).join("");
  }

  /**
   * colorIncrement(color, range) - 计算 RGB 各通道的增量
   * @param {Object} color - {start: '#hex', end: '#hex'}
   * @param {number} range - 权重总跨度
   * @returns {number[]} 如 [2.5, -1.1, 0.8]
   */
  function colorIncrement (color, range) {
    return jQuery.map(toRGB(color.end), function(n, i) {
      return (n - toRGB(color.start)[i]) / range;
    });
  }

  /**
   * tagColor(color, increment, weighting) - 计算标签的最终颜色
   * @param {Object} color     - {start, end} 颜色范围
   * @param {number[]} increment - RGB 各通道增量
   * @param {number} weighting  - 当前权重偏移
   * @returns {string} 十六进制颜色
   */
  function tagColor (color, increment, weighting) {
    var rgb = jQuery.map(toRGB(color.start), function(n, i) {
      var ref = Math.round(n + (increment[i] * weighting));
      if (ref > 255) { ref = 255; }        // 上限钳制
      else if (ref < 0) { ref = 0; }       // 下限钳制
      return ref;
    });
    return toHex(rgb);
  }

  /**
   * compareWeights(a, b) - 数字升序排序比较函数
   */
  function compareWeights(a, b)
  {
    return a - b;
  }

})(jQuery);
