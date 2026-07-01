/*!
 * jQuery TagCloud Plugin
 *
 * 功能：根据标签的 rel 属性（权重值）动态调整标签的字体大小和背景颜色
 * 用法：$('.tag a').tagcloud({ size: {start:14, end:24, unit:'px'}, color: {start:'#ccc', end:'#333'} })
 *
 * 优化说明：
 * - 修复全局变量污染：为所有变量添加 var/let/const 声明
 * - 简化 map -> makeArray 为直接的 .get() 调用
 * - 移除冗余的 compareWeights 函数，内联为箭头函数
 * - 为所有函数添加中文注释和参数说明
 */

(function ($) {

    /**
     * 标签云插件主方法
     *
     * @param {Object} options - 配置项
     *   @param {Object} [options.size]        - 字体大小配置
     *     @param {number} options.size.start  - 最小字体大小（默认 14）
     *     @param {number} options.size.end    - 最大字体大小（默认 18）
     *     @param {string} options.size.unit   - 字体大小单位（默认 "pt"）
     *   @param {Object} [options.color]       - 颜色配置
     *     @param {string} options.color.start - 起始颜色（十六进制，如 "#cccccc"）
     *     @param {string} options.color.end   - 结束颜色（十六进制，如 "#333333"）
     */
    $.fn.tagcloud = function (options) {
        var opts = $.extend({}, $.fn.tagcloud.defaults, options);

        // 获取所有标签的权重值（从 rel 属性读取），排序得到最低和最高权重
        var tagWeights = this.map(function () {
            return $(this).attr("rel");
        }).get().sort(function (a, b) {
            return a - b;  // 数字升序排序
        });

        var lowest = tagWeights[0];           // 最低权重值
        var highest = tagWeights.pop();        // 最高权重值（pop 会移除最后一个元素）
        var range = highest - lowest || 1;     // 权重范围，避免除以零

        // 计算字体大小步进值：权重每增加 1，字体增大多少
        var fontIncr = 0;
        if (opts.size) {
            fontIncr = (opts.size.end - opts.size.start) / range;
        }

        // 计算颜色步进值（RGB 三个通道各一个值组成的数组）
        var colorIncr = 0;
        if (opts.color) {
            colorIncr = calcColorIncrement(opts.color, range);
        }

        // 遍历每个标签元素，应用计算出的样式
        return this.each(function () {
            var $el = $(this);
            var weighting = $el.attr("rel") - lowest;  // 当前标签相对于最低权重的偏移量

            // 设置字体大小：基础值 + 偏移量 × 步进值
            if (opts.size) {
                var fontSize = opts.size.start + (weighting * fontIncr) + opts.size.unit;
                $el.css({ "font-size": fontSize });
            }

            // 设置背景颜色：根据权重在起始色和结束色之间插值
            if (opts.color) {
                $el.css({ "backgroundColor": interpolateColor(opts.color, colorIncr, weighting) });
            }
        });
    };

    // 默认配置
    $.fn.tagcloud.defaults = {
        size: { start: 14, end: 18, unit: "pt" }
    };

    // ============================================================
    // 内部工具函数
    // ============================================================

    /**
     * 将十六进制颜色字符串转换为 RGB 数组
     *
     * @param {string} code - 十六进制颜色值，如 "#c30" 或 "#cc3300"
     * @returns {number[]}  RGB 三通道数组，如 [204, 51, 0]
     */
    function toRGB(code) {
        // 处理简写格式：#abc → #aabbcc
        if (code.length === 4) {
            code = $.map(/\w+/.exec(code), function (el) {
                return el + el;
            }).join("");
        }
        // 提取 R、G、B 三个两位十六进制值并转为十进制
        var hex = /(\w{2})(\w{2})(\w{2})/.exec(code);
        return [parseInt(hex[1], 16), parseInt(hex[2], 16), parseInt(hex[3], 16)];
    }

    /**
     * 将 RGB 数组转换为十六进制颜色字符串
     *
     * @param {number[]} ary - 包含三个 0-255 整数的 RGB 数组
     * @returns {string}     十六进制颜色值，如 "#cc3300"
     */
    function toHex(ary) {
        return "#" + $.map(ary, function (val) {
            var hexStr = val.toString(16);
            // 确保两位十六进制（0 → "00", 255 → "ff"）
            return (hexStr.length === 1) ? "0" + hexStr : hexStr;
        }).join("");
    }

    /**
     * 计算起始色到结束色每个 RGB 通道的线性步进值
     *
     * @param {Object} color - 颜色对象 {start: "#hex", end: "#hex"}
     * @param {number} range - 权重范围（总步数）
     * @returns {number[]}   三个通道的步进值数组 [R步进, G步进, B步进]
     */
    function calcColorIncrement(color, range) {
        var startRGB = toRGB(color.start);
        var endRGB = toRGB(color.end);
        return $.map(endRGB, function (endVal, i) {
            return (endVal - startRGB[i]) / range;
        });
    }

    /**
     * 根据权重偏移量在起始色和结束色之间线性插值颜色
     *
     * @param {Object} color     - 颜色对象 {start: "#hex", end: "#hex"}
     * @param {number[]} increment - 各通道步进值数组
     * @param {number} weighting  - 当前标签的权重偏移量
     * @returns {string}          插值后的十六进制颜色值
     */
    function interpolateColor(color, increment, weighting) {
        var startRGB = toRGB(color.start);
        var rgb = $.map(startRGB, function (startVal, i) {
            var ref = Math.round(startVal + (increment[i] * weighting));
            // 钳制到有效的 RGB 范围 [0, 255]
            if (ref > 255) return 255;
            if (ref < 0)   return 0;
            return ref;
        });
        return toHex(rgb);
    }

})(jQuery);
