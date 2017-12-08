<template>
    <div class="markdown-editor-box">
        <link rel="stylesheet" href="/static/editor.md/css/editormd.min.css">
        <link rel="stylesheet" :href="'/static/editor.md/css/google_code_prettify_themes/' + codeTheme">
        <div :id="editorId"></div>
    </div>
</template>

<script>
    import scriptjs from 'scriptjs';
    import { defaultConfig, codeThemes } from '../../config/editor.md';

    // 一个界面多个编辑器，多次引入样式问题？
    export default {
        props: {
            editorId: {
                'type': String,
                'default': 'markdown-editor',
            },
            onchange: { // 内容改变时回调，返回（html, markdown, text）
                type: Function
            },
            config: { // 编辑器配置文件
                type: Object
            },
            codeTheme: { // 代码高亮主题，传入 codeThemes 中 monokai 的值
                'type': String,
                'default': codeThemes[0].value
            },
        },
        data: function() {
            return {
                editor: null,
                codeThemes,
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

            getConfig: function () {
                return {...defaultConfig, ...this.config };
            },

            initEditor: function () {
                (async () => {
                    await this.fetchScript('/static/editor.md/jquery.min.js');
                    await this.fetchScript('/static/editor.md/editormd.min.js');

                    this.$nextTick(() => {
                        let editor = window.editormd(this.editorId, this.getConfig());

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
//            this.editor.off('change');
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