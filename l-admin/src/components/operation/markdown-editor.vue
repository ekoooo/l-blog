<template>
  <div class="markdown-editor-box">
    <link rel="stylesheet" href="/static/editor.md/css/editormd.min.css">
    <link rel="stylesheet" :href="'/static/editor.md/css/google_code_prettify_themes/' + codeTheme">
    <div :id="editorId"></div>
  </div>
</template>

<script>
  import scriptjs from 'scriptjs';
  import { defaultConfig } from '../../config/editor.md';

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
      config: { // 编辑器配置
        type: Object
      },
      codeTheme: { // 代码高亮主题
        'type': String,
        'default': 'vibrant-ink.min.css'
      },
      initData: {
        'type': String
      },
      initDataDelay: {
        'type': Number, // 延迟初始化时间，单位毫秒
        'default': 0
      }
    },
    data: function() {
      return {
        editor: null,
        editorLoaded: false,
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
          // await this.fetchScript('/static/editor.md/editormd.js');

          this.$nextTick(() => {
            this.editor = window.editormd(this.editorId, this.getConfig());

            this.editor.on('load', () => {
              setTimeout(() => { // hack bug: 多个编辑器只能初始化一个的问题
                this.editorLoaded = true;
                this.initData && this.editor.setMarkdown(this.initData);
              }, this.initDataDelay);
            });

            this.onchange && this.editor.on('change', () => {
              let html = this.editor.getPreviewedHTML();

              this.onchange({
                markdown: this.editor.getMarkdown(),
                html: html,
                text: window.$(html).text()
              });
            });
          });
        })();
      }
    },
    mounted: function() {
      this.initEditor();
    },
    watch: {
      'initData': function (newVal) {
        if(newVal) {
          this.editorLoaded && this.editor.setMarkdown(newVal);
        }
      }
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