/* ============================================================
 * Gruntfile.js — Grunt 自动化构建脚本
 * ============================================================
 *
 * 用途：自动化编译 LESS → CSS、压缩 JS、添加版权横幅
 *
 * 工作流程（grunt 或 grunt default）：
 *   1. uglify    → 压缩 JS（hux-blog.js → hux-blog.min.js）
 *   2. less      → 编译 LESS（hux-blog.less → hux-blog.css + .min.css）
 *   3. usebanner → 在 CSS/JS 文件顶部添加版权横幅
 *
 * 开发模式（grunt watch）：
 *   - 监听 .less 文件变化 → 自动重新编译 CSS
 *   - 监听 .js  文件变化 → 自动重新压缩 JS
 *
 * 依赖插件（已在 package.json 的 devDependencies 中声明）：
 *   grunt-contrib-uglify  → JS 压缩
 *   grunt-contrib-less    → LESS 编译
 *   grunt-banner          → 文件头部横幅
 *   grunt-contrib-watch   → 文件变化监听
 *
 * 修复说明：
 *   原 Gruntfile 使用 <%= pkg.name %> 动态引用文件（→ by-blog.*），
 *   但项目实际文件名为 hux-blog.*，导致 all 任务找不到源文件而静默失败。
 *   已修正为直接使用 hux-blog 文件名匹配项目实际结构。
 * ========================================================== */

module.exports = function (grunt) {

    // ---- 项目配置 -------------------------------------------------
    grunt.initConfig({

        /**
         * pkg : 从 package.json 读取项目元信息
         *       用于 `<%= pkg.title %>`、`<%= pkg.version %>` 等模板占位
         */
        pkg: grunt.file.readJSON('package.json'),


        // ============================================================
        // uglify — JS 压缩任务
        // ============================================================
        // 将源 JS 文件压缩为 .min.js（移除空格、注释、缩短变量名）
        //
        // 配置项：
        //   src  : 源文件路径（支持 `<%= %>` 模板语法引用配置变量）
        //   dest : 压缩后输出路径
        // ============================================================
        uglify: {
            main: {
                src: 'js/hux-blog.js',          // 源文件：未压缩的博客主题 JS
                dest: 'js/hux-blog.min.js'      // 输出：压缩后的 JS（供生产环境使用）
            }
        },


        // ============================================================
        // less — LESS 编译任务
        // ============================================================
        // 将 LESS 源码编译为 CSS，分两个目标：
        //   expanded → 格式化 CSS（可读，调试用）
        //   minified → 压缩 CSS（生产用，启用 CleanCSS）
        //
        // 注：hux-blog.less 通过 @import 引入其他 .less 文件，
        //     只需编译这一个入口文件即可生成完整 CSS
        // ============================================================
        less: {

            /**
             * expanded — 展开格式输出（保留缩进和换行，方便调试）
             *
             * options.paths : LESS @import 搜索路径（"css" 目录）
             */
            expanded: {
                options: {
                    paths: ["css"]
                },
                files: {
                    "css/hux-blog.css": "less/hux-blog.less"   // 源 → 目标
                }
            },

            /**
             * minified — 压缩格式输出（生产环境用）
             *
             * options.paths    : LESS @import 搜索路径
             * options.cleancss : true → 启用 CleanCSS 压缩（移除空格、注释等）
             */
            minified: {
                options: {
                    paths: ["css"],
                    cleancss: true
                },
                files: {
                    "css/hux-blog.min.css": "less/hux-blog.less"  // 源 → 目标
                }
            }
        },


        // ============================================================
        // banner — 版权横幅模板
        // ============================================================
        // 由 usebanner 任务引用，插入到输出文件顶部
        //
        // 模板变量（来自 pkg）：
        //   <%= pkg.title %>     → "BY Blog"
        //   <%= pkg.version %>   → "1.7.0"
        //   <%= pkg.homepage %>  → 项目主页 URL
        //   <%= pkg.author %>    → 作者信息
        //
        // 模板变量（Grunt 内置）：
        //   <%= grunt.template.today("yyyy") %> → 当前年份（如 "2026"）
        // ============================================================
        banner:
            '/*!\n' +
            ' * <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
            ' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
            ' */\n',


        // ============================================================
        // usebanner — 文件头部横幅注入任务
        // ============================================================
        // 将 banner 模板插入到指定文件的顶部
        //
        // options.position : 'top' → 插入到文件开头
        // options.banner   : 横幅内容（引用上面定义的 banner 模板）
        // files.src        : 需要添加横幅的文件列表
        // ============================================================
        usebanner: {
            dist: {
                options: {
                    position: 'top',
                    banner: '<%= banner %>'
                },
                files: {
                    src: [
                        'css/hux-blog.css',        // 展开版 CSS
                        'css/hux-blog.min.css',    // 压缩版 CSS
                        'js/hux-blog.min.js'       // 压缩版 JS
                    ]
                }
            }
        },


        // ============================================================
        // watch — 文件变化监听任务（开发模式）
        // ============================================================
        // 运行 `grunt watch` 启动，文件变化时自动执行对应任务
        //
        // options.spawn : false → 在同一个进程中运行任务（更快）
        //                         如果遇到内存或稳定性问题，改为 true
        // ============================================================
        watch: {

            /**
             * scripts — 监听 JS 源文件变化 → 自动压缩
             */
            scripts: {
                files: ['js/hux-blog.js'],         // 监听的文件（支持通配符）
                tasks: ['uglify'],                 // 变化后执行的任务
                options: {
                    spawn: false                   // 复用进程，避免每次 spawn 的启动延迟
                }
            },

            /**
             * less — 监听 LESS 源文件变化 → 自动编译
             *        监听所有 .less 文件（含 mixins、variables 等依赖）
             */
            less: {
                files: ['less/*.less'],            // 监听 less/ 目录下所有 .less 文件
                tasks: ['less'],                   // 变化后完整重新编译
                options: {
                    spawn: false
                }
            }
        }
    });


    // ---- 加载 Grunt 插件 ----------------------------------------------
    // 每个插件提供对应名称的任务（如 grunt-contrib-uglify 提供 "uglify" 任务）
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-banner');
    grunt.loadNpmTasks('grunt-contrib-watch');


    /**
     * ---- 默认任务 ----------------------------------------------------
     *
     * 运行 `grunt` 或 `grunt default` 时执行：
     *   1. uglify    → 压缩 JS
     *   2. less      → 编译 LESS（同时生成 expanded + minified）
     *   3. usebanner → 在输出文件顶部添加版权横幅
     *
     * 任务按数组顺序依次执行（串行，前一个完成后才执行下一个）
     */
    grunt.registerTask('default', ['uglify', 'less', 'usebanner']);

};
