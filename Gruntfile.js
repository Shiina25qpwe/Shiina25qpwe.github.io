/**
 * ============================================================
 *  Gruntfile.js — Grunt 构建系统配置
 * ============================================================
 *
 *  Grunt (https://gruntjs.com/) 是一个 JavaScript 任务运行器,
 *  用于自动化前端构建流程: 编译 Less → CSS, 压缩 JS, 添加版权横幅等。
 *
 *  【安装】
 *    npm install -g grunt-cli    # 全局安装 Grunt 命令行
 *    npm install                  # 安装项目依赖 (读取 package.json)
 *
 *  【常用命令】
 *    grunt           → 执行默认任务 (uglify + less + usebanner)
 *    grunt watch     → 监听文件变化, 自动重新构建
 *    grunt uglify    → 仅压缩 JS
 *    grunt less      → 仅编译 Less
 *
 *  【构建流程】(默认任务 grunt)
 *    1. uglify   → JS 压缩 (hux-blog.js → hux-blog.min.js)
 *    2. less     → Less 编译 (hux-blog.less → hux-blog.css + .min.css)
 *    3. usebanner→ 在输出文件顶部添加版权横幅
 *
 *  【依赖的 Grunt 插件】(npm install 时安装)
 *    grunt-contrib-uglify : JS 压缩 (UglifyJS)
 *    grunt-contrib-less   : Less → CSS 编译
 *    grunt-banner         : 添加文件头部横幅
 *    grunt-contrib-watch  : 文件监听 + 自动构建
 *
 *  【pkg 变量】(读取 package.json)
 *    pkg.name     : 项目名 (如 "hux-blog")
 *    pkg.version  : 版本号 (如 "1.6.0")
 *    pkg.title    : 完整标题 (如 "Hux Blog")
 *    pkg.homepage : 项目主页 URL
 *    pkg.author   : 作者名
 */

module.exports = function(grunt) {

    // ==========================================================
    //  项目配置
    // ==========================================================
    grunt.initConfig({

        /**
         * pkg — 读取 package.json 中的项目元数据
         * 
         * 后续任务中通过 <%= pkg.name %> 等模板语法引用这些值。
         * 例如 pkg.name = "hux-blog" 时:
         *   'js/<%= pkg.name %>.js'  → 'js/hux-blog.js'
         */
        pkg: grunt.file.readJSON('package.json'),


        // ── 任务 1: JS 压缩 (Uglify) ───────────────────────

        /**
         * uglify — 使用 UglifyJS 压缩 JavaScript 文件
         * 
         * src  : 源文件 (未压缩的 JS)
         * dest : 输出文件 (压缩后的 .min.js)
         * 
         * UglifyJS 会:
         *   - 移除空格/换行/注释
         *   - 缩短变量名 (mangling)
         *   - 移除无用代码 (dead code elimination)
         */
        uglify: {
            main: {
                src: 'js/<%= pkg.name %>.js',       // 如 js/hux-blog.js
                dest: 'js/<%= pkg.name %>.min.js'   // 如 js/hux-blog.min.js
            }
        },


        // ── 任务 2: Less 编译 ───────────────────────────────

        /**
         * less — 将 Less 源文件编译为 CSS
         * 
         * expanded — 展开格式 (保留换行/缩进, 便于调试)
         *   options.paths : Less @import 的搜索路径 (["css"])
         *   files         : "输出.css": "源.less"
         * 
         * minified — 压缩格式 (单行, 移除空白, 适合生产环境)
         *   cleancss: true → 使用 CleanCSS 进行额外压缩
         *   (合并相同规则、缩短颜色值等)
         */
        less: {
            // 展开版 (可读, 调试用)
            expanded: {
                options: {
                    paths: ["css"]                         // @import 搜索路径
                },
                files: {
                    "css/<%= pkg.name %>.css": "less/<%= pkg.name %>.less"
                }
            },
            // 压缩版 (生产环境)
            minified: {
                options: {
                    paths: ["css"],                       // @import 搜索路径
                    cleancss: true                        // 启用 CleanCSS 压缩
                },
                files: {
                    "css/<%= pkg.name %>.min.css": "less/<%= pkg.name %>.less"
                }
            }
        },


        // ── 任务 3: 版权横幅 ────────────────────────────────

        /**
         * banner — 生成版权横幅字符串
         * 
         * <%= pkg.title %>     : 项目标题
         * <%= pkg.version %>   : 版本号
         * <%= pkg.homepage %>  : 项目 URL
         * grunt.template.today("yyyy") : 当前年份 (如 "2026")
         * <%= pkg.author %>    : 作者名
         * 
         * 最终生成如:
         *   /*! Hux Blog v1.6.0 (https://...) Copyright 2026 @huxpro *​/
         */
        banner: '/*!\n' +
            ' * <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
            ' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
            ' */\n',

        /**
         * usebanner — 将 banner 添加到输出文件顶部
         * 
         * position: 'top'  → 横幅放在文件开头
         *                    'bottom' → 放在文件末尾
         * '<%= banner %>'  → 引用上面定义的 banner 字符串
         * 
         * 目标文件:
         *   hux-blog.css, hux-blog.min.css, hux-blog.min.js
         */
        usebanner: {
            dist: {
                options: {
                    position: 'top',
                    banner: '<%= banner %>'
                },
                files: {
                    src: [
                        'css/<%= pkg.name %>.css',
                        'css/<%= pkg.name %>.min.css',
                        'js/<%= pkg.name %>.min.js'
                    ]
                }
            }
        },


        // ── 任务 4: 文件监听 (Watch) ────────────────────────

        /**
         * watch — 监听文件变化, 自动触发对应任务
         * 
         * scripts — 监听 JS 源文件
         *   files : 监听的文件模式
         *   tasks : 变化时执行的任务 (uglify → 压缩 → usebanner 自动加横幅)
         * 
         * less — 监听 Less 源文件
         *   files : 监听 less/ 下所有 .less 文件
         *   tasks : 变化时执行的任务 (less → 编译 → usebanner)
         * 
         * options.spawn : 
         *   false → 在当前进程运行任务 (更快, 但内存可能泄漏)
         *   true  → 每次变化启动新子进程 (更稳定, 但更慢)
         *   文件监听场景推荐 false (速度优先)
         */
        watch: {
            scripts: {
                files: ['js/<%= pkg.name %>.js'],
                tasks: ['uglify'],
                options: {
                    spawn: false
                }
            },
            less: {
                files: ['less/*.less'],
                tasks: ['less'],
                options: {
                    spawn: false
                }
            }
        }
    });


    // ==========================================================
    //  加载 Grunt 插件
    // ==========================================================
    //  每个插件提供一类任务:
    //    grunt-contrib-uglify  → uglify 任务 (JS 压缩)
    //    grunt-contrib-less    → less 任务 (Less 编译)
    //    grunt-banner          → usebanner 任务 (添加横幅)
    //    grunt-contrib-watch   → watch 任务 (文件监听)
    //
    //  插件需提前通过 npm install 安装到 node_modules/
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-banner');
    grunt.loadNpmTasks('grunt-contrib-watch');


    // ==========================================================
    //  注册任务
    // ==========================================================

    /**
     * 默认任务 — 运行 grunt (无参数) 时执行
     * 
     * 执行顺序:
     *   1. uglify     → 压缩 JS
     *   2. less       → 编译 Less (展开版 + 压缩版)
     *   3. usebanner  → 添加版权横幅
     */
    grunt.registerTask('default', ['uglify', 'less', 'usebanner']);

};
