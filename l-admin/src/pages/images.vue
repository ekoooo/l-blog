<template>
  <div class="box">
    <el-dialog
      title="图片预览"
      :append-to-body="true"
      :visible.sync="previewDialogVisible">
      <div class="preview-img-box">
        <img :src="previewUrl">
      </div>
    </el-dialog>
    <div class="box-header">
      <h2 class="title">{{ title }}</h2>
    </div>
    <div class="box-content">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="图片列表" name="1" v-loading="listLoading">
          <div class="card-content clearfix">
            <ul>
              <li
                @click="getImageList(true)"
                class="op-btn item">
                  <i class="fa fa-refresh"></i>
              </li>
              <li class="item" v-for="item in listData" :key="item.hash">
                <a
                  :href="QINIU_IMAGE_DOMAIN + item.key"
                  target="_blank">
                  <img
                    v-if="item.mimeType.indexOf('image') !== -1"
                    :src="QINIU_IMAGE_DOMAIN + item.key">
                  <span v-else>{{ QINIU_IMAGE_DOMAIN + item.key }}</span>
                </a>
                <div class="op">
                  <a
                    @click="del(item.key)"
                    href="javascript: void(0);">
                    删除
                  </a>
                  <a
                    :data-clipboard-text="QINIU_IMAGE_DOMAIN + item.key"
                    class="cp-btn"
                    href="javascript: void(0);">
                    复制
                  </a>
                </div>
              </li>
              <li
                v-if="nextMarker"
                @click="getImageList(false)"
                class="item op-btn">
                <i class="fa fa-arrow-right"></i>
              </li>
            </ul>
          </div>
        </el-tab-pane>
        <el-tab-pane label="上传图片" name="2">
          <div class="card-content clearfix upload-box">
            <el-upload
              drag
              multiple
              :before-upload="beforeUpload"
              :on-preview="previewImg"
              :on-success="onUploadSuccess"
              :on-error="onUploadError"
              :action="QINIU_UPLOAD_URL"
              :data="{
                'token': token,
                'key': fileKey
              }">
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            </el-upload>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
  import ImageLogic from '../logic/image';
  import MSG from '../utils/message';
  import Clipboard from 'clipboard';
  import { QINIU_UPLOAD_URL, QINIU_IMAGE_DOMAIN } from '../config/index';

  export default {
    data: function() {
      return {
        activeTab: '1',
        nextMarker: undefined,

        token: undefined,
        fileKey: undefined,
        uploading: false,

        listData: [],
        listLoading: false,

        previewUrl: undefined,
        previewDialogVisible: false,

        QINIU_UPLOAD_URL,
        QINIU_IMAGE_DOMAIN,
      };
    },
    methods: {
      /**
       * 获取图片列表
       * @param init 是否初始化
       */
      getImageList(init) {
        this.listLoading = true;

        ImageLogic.getList(init ? '' : this.nextMarker).then(rs => {
          if(rs.code === 200) {
            if(!init) {
              this.listData = [...this.listData, ...rs.info.items];
            }else {
              this.listData = rs.info.items;
            }
            this.nextMarker = rs.info.nextMarker;
          }else {
            MSG.error(rs.message);
          }
          this.listLoading = false;
        }).catch(err => {
          this.listLoading = false;
        });
      },

      /**
       * 初始化复制插件
       */
      initClipboard() {
        let clipboard = new Clipboard('.cp-btn');

        clipboard.on('success', function(e) {
          MSG.success('复制成功 => ' + e.text);
        });

        clipboard.on('error', function(e) {
          MSG.success('复制失败！');
        });
      },

      /**
       * 删除图片
       */
      del(key) {
        MSG.warningConfirm('是否确定删除？').then((confirm) => {
          if(!confirm) { return; }

          this.listLoading = true;

          ImageLogic.deleteImage(key).then(rs => {
            if(rs.code === 200) {
              MSG.success('删除成功！');
              // 刷新
              this.getImageList(true);
            }else {
              MSG.error(rs.message);
            }

            this.listLoading = false;
          }).catch(() => {
            this.listLoading = false;
          });
        });
      },

      /**
       * 预览图片（上传控件中）
       * @param file
       */
      previewImg(file) {
        this.previewUrl = this.QINIU_IMAGE_DOMAIN + file.response.key;
        this.previewDialogVisible = true;
      },

      onUploadError(err, file, fileList) {
        this.$notify.error({
          title: '上传失败',
          message: '错误代码：' + err.status
        });
      },

      onUploadSuccess(response, file, fileList) {
        MSG.success('上传成功！');
      },

      /**
       * 设置 Token
       */
      setToken() {
        ImageLogic.getUploadToken().then(rs => {
          if(rs.code === 200) {
            this.token = rs.info;
          }else {
            MSG.error(rs.message);
          }
        });
      },

      beforeUpload(file) {
        let setKey = () => {
          let index = 9999999999999 - new Date().getTime();
          let suffix = file.name.substring(file.name.lastIndexOf('.'), file.name.length);
          let uid = file.uid;
          // 七牛云根据 Key 排序，倒排
          this.fileKey =  `${ index }_${ uid }${ suffix }`;
        };

        return new Promise((resolve, reject) => {
          // 避免异步赋值未成功
          setTimeout(() => {
            setKey();
            resolve();
          });
        });
      },
    },
    computed: {
      title: function() {
        return this.$route.meta.title;
      }
    },
    created: function() {
      // 初始化复制
      this.initClipboard();

      // 获取图片列表
      this.getImageList(true);
    },
    watch: {
      activeTab: function(newVal, oldVal) {
        if(newVal === '2') {
          // 初始化 Token
          !this.token && this.setToken();
        }
      },
    },
  }
</script>

<style lang="scss" scoped>
  @import '../assets/scss/const';

  .card-content {
    .item {
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      overflow: hidden;

      border: 1px solid $gray-line-color;
      width: 100px;
      height: 100px;
      word-break: break-all;
      float: left;
      margin-right: 16px;
      margin-bottom: 16px;
      padding: 10px;
      cursor: pointer;
      transition: opacity .2s;

      .op {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0,0,0,.5);

        a {
          float: left;
          width: 50%;
          text-align: center;
          line-height: 20px;
          text-decoration: none;
          color: #fff;
          outline: none;
          user-select: none;

          &:hover {
            background: rgba(0,0,0,.4);
          }
        }
      }

      img {
        width: 100%;
        height: 100%;
      }

      &.op-btn {
        user-select: none;
        background-color: $frame-bg-color;
      }
    }
  }

  .upload-box {
    width: 360px;
    margin: 0 auto;
  }

  .preview-img-box {
    max-width: 400px;
    margin: 0 auto;

    display: flex;
    justify-content: center;
    align-items: center;

    img {
      max-width: 90%;
      max-height: 90%;
    }
  }

  .fa-refresh, .fa-arrow-right {
    font-size: 30px;
    color: $main-color;
  }
</style>
