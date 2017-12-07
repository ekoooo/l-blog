<template>
    <div class="markdown-editor-box">
        <el-select v-model="codeTheme" placeholder="请选择主题">
            <el-option
                v-for="item in codeThemes"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
        </el-select>
        <link rel="stylesheet" href="/static/editor.md/css/editormd.min.css">
        <link rel="stylesheet" :href="'/static/editor.md/css/google_code_prettify_themes/' + codeTheme">
        <div id="markdown-editor"></div>
    </div>
</template>

<script>
    import scriptjs from 'scriptjs';

    export default {
        props: {
            onchange: {
                type: Function
            },
            config: {
                type: Object,
                'default'() {
                    return {
                        width: "100%",
                        height: 600,
                        path: '/static/editor.md/lib/',
                        // theme: "dark",
                        // previewTheme: "dark",
                        // editorTheme: "pastel-on-dark",
                        // markdown: md,                // 默认填充内容
                        codeFold: true,
                        placeholder: '请输入...',
                        //syncScrolling: false,
                        saveHTMLToTextarea: true,       // 保存 HTML 到 Textarea
                        searchReplace: true,
                        watch: true,                                // 实时预览
                        // htmlDecode: "style,script,iframe|on*",      // 开启 HTML 标签解析，为了安全性，默认不开启
                        toolbar: true,                  //工具栏
                        previewCodeHighlight: true,     // 预览 HTML 的代码块高亮，默认开启
                        emoji: true,
                        taskList: true,
                        tocm: true,                     // Using [TOCM]
                        tex: true,                      // 开启科学公式TeX语言支持，默认关闭
                        flowChart: true,                // 开启流程图支持，默认关闭
                        sequenceDiagram: true,          // 开启时序/序列图支持，默认关闭,
                        // dialogLockScreen: false,      // 设置弹出层对话框不锁屏，全局通用，默认为true
                        // dialogShowMask: false,        // 设置弹出层对话框显示透明遮罩层，全局通用，默认为true
                        // dialogDraggable: false,       // 设置弹出层对话框不可拖动，全局通用，默认为true
                        // dialogMaskOpacity: 0.4,       // 设置透明遮罩层的透明度，全局通用，默认值为0.1
                        // dialogMaskBgColor: "#000",    // 设置透明遮罩层的背景颜色，全局通用，默认为#fff
                        imageUpload: false,
                        // imageFormats: ["jpg", "jpeg", "gif", "png", "bmp", "webp"],
                        // imageUploadURL: "./php/upload.php",
                        onload: function() {
                            // this.fullscreen();
                            // this.unwatch();
                            // this.watch().fullscreen();
                            // this.setMarkdown("#PHP");
                            // this.width("100%");
                            // this.height(480);
                            // this.resize("100%", 640);
                        },
                    };
                }
            },
        },
        data: function() {
            return {
                editor: null,
                codeTheme: 'monokai.min.css',
                codeThemes: [
                    {
                        label: 'monokai',
                        value: 'monokai.min.css',
                    },
                    {
                        label: 'atelier-cave-dark',
                        value: 'atelier-cave-dark.min.css',
                    },
                    {
                        label: 'atelier-cave-light',
                        value: 'atelier-cave-light.min.css',
                    },
                    {
                        label: 'atelier-dune-dark',
                        value: 'atelier-dune-dark.min.css',
                    },
                    {
                        label: 'atelier-dune-light',
                        value: 'atelier-dune-light.min.css',
                    },
                    {
                        label: 'atelier-estuary-dark',
                        value: 'atelier-estuary-dark.min.css',
                    },
                    {
                        label: 'atelier-estuary-light',
                        value: 'atelier-estuary-light.min.css',
                    },
                    {
                        label: 'atelier-forest-dark',
                        value: 'atelier-forest-dark.min.css',
                    },
                    {
                        label: 'atelier-forest-light',
                        value: 'atelier-forest-light.min.css',
                    },
                    {
                        label: 'atelier-heath-dark',
                        value: 'atelier-heath-dark.min.css',
                    },
                    {
                        label: 'atelier-heath-light',
                        value: 'atelier-heath-light.min.css',
                    },
                    {
                        label: 'atelier-lakeside-dark',
                        value: 'atelier-lakeside-dark.min.css',
                    },
                    {
                        label: 'atelier-lakeside-light',
                        value: 'atelier-lakeside-light.min.css',
                    },
                    {
                        label: 'atelier-plateau-dark',
                        value: 'atelier-plateau-dark.min.css',
                    },
                    {
                        label: 'atelier-plateau-light',
                        value: 'atelier-plateau-light.min.css',
                    },
                    {
                        label: 'atelier-savanna-dark',
                        value: 'atelier-savanna-dark.min.css',
                    },
                    {
                        label: 'atelier-savanna-light',
                        value: 'atelier-savanna-light.min.css',
                    },
                    {
                        label: 'atelier-seaside-dark',
                        value: 'atelier-seaside-dark.min.css',
                    },
                    {
                        label: 'atelier-seaside-light',
                        value: 'atelier-seaside-light.min.css',
                    },
                    {
                        label: 'atelier-sulphurpool-dark',
                        value: 'atelier-sulphurpool-dark.min.css',
                    },
                    {
                        label: 'atelier-sulphurpool-light',
                        value: 'atelier-sulphurpool-light.min.css',
                    },
                    {
                        label: 'github',
                        value: 'github.min.css',
                    },
                    {
                        label: 'github-v2',
                        value: 'github-v2.min.css',
                    },
                    {
                        label: 'hemisu-dark',
                        value: 'hemisu-dark.min.css',
                    },
                    {
                        label: 'hemisu-light',
                        value: 'hemisu-light.min.css',
                    },
                    {
                        label: 'tomorrow',
                        value: 'tomorrow.min.css',
                    },
                    {
                        label: 'tomorrow-night',
                        value: 'tomorrow-night.min.css',
                    },
                    {
                        label: 'tomorrow-night-blue',
                        value: 'tomorrow-night-blue.min.css',
                    },
                    {
                        label: 'tomorrow-night-bright',
                        value: 'tomorrow-night-bright.min.css',
                    },
                    {
                        label: 'tomorrow-night-eighties',
                        value: 'tomorrow-night-eighties.min.css',
                    },
                    {
                        label: 'tranquil-heart',
                        value: 'tranquil-heart.min.css',
                    },
                    {
                        label: 'vibrant-ink',
                        value: 'vibrant-ink.min.css',
                    },
                ]
            };
        },
        methods: {
            fetchScript: function(url) {
                return new Promise((resolve) => {
                    scriptjs(url, () => {
                        resolve();
                    });
                });
            },

            initEditor: function () {
                (async () => {
                    await this.fetchScript('/static/editor.md/jquery.min.js');
                    await this.fetchScript('/static/editor.md/editormd.min.js');

                    this.$nextTick(() => {
                        let editor = window.editormd('markdown-editor', this.config);

                        this.onchange && editor.on('change', () => {
                            let html = editor.getHTML();

                            this.onchange({
                                markdown: editor.getMarkdown(),
                                html: html,
                                text: window.$(html).text()
                            });
                        });

                        this.editor = editor;
                    });
                })();
            }
        },
        mounted: function() {
            this.initEditor();
        },
        destroyed: function () {
            this.editor.off('change');
        }
    }
</script>

<style lang="scss" scoped>
    .markdown-editor-box {
        ::-webkit-scrollbar-track-piece {
            width: 6px;
            background: #eee;
            border: 0;
            border-radius: 0;
        }
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
            border: 0;
            background: #eee;
            border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb {
            background-color: #eee - 50;
            border: 0;
            border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background-color: #eee - 100;
        }
    }
</style>