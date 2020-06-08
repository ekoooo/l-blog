<template>
  <div>
    <el-form
      :model="formInfo"
      ref="form"
      label-width="100px"
      @submit.native.prevent>
      <el-form-item
        required
        label="配置键">
        <el-input
          v-model="formInfo.key"
          class="wd10"
          :maxlength="64"
          placeholder="请输入配置键"
          size="small">
        </el-input>
      </el-form-item>
      <el-form-item
        required
        label="配置值">
        <el-input
          v-model="formInfo.val"
          type="textarea"
          :rows="3"
          class="wd15"
          placeholder="请输入配置值">
        </el-input>
      </el-form-item>
      <el-form-item
        label="备用值">
        <el-input
          v-model="formInfo.extraVal"
          type="textarea"
          :rows="3"
          class="wd15"
          placeholder="请输入备用值">
        </el-input>
      </el-form-item>
      <el-form-item
        required
        label="描述">
        <el-input
          v-model="formInfo.description"
          type="textarea"
          :rows="3"
          class="wd15"
          :maxlength="128"
          placeholder="请输入描述">
        </el-input>
      </el-form-item>
      <el-form-item
        label="状态">
        <config-status-selector
          v-model="formInfo.status"
          size="small"
          class="wd10"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          size="small"
          type="primary"
          @click.native="commit"
          :icon="isEdit ? 'el-icon-edit' : 'el-icon-plus'"
          :loading="commitLoading">
          {{ isEdit ? '保存' : '添加' }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import MSG from '../../utils/message';
  import SysConfigLogic from '../../logic/sys_config';
  import configStatusSelector from '../selector/config-status';
  import Util from '../../utils/util';

  export default {
    props: ['data', 'cb'],
    data: function () {
      return {
        formInfo: {
          id: undefined,
          key: undefined,
          val: undefined,
          extraVal: undefined,
          description: undefined,
          status: 1,
          t: undefined, // 用于监听该变量是否改变，清除输入框遗留内容
        },
        commitLoading: false,
      };
    },
    methods: {
      setFormInfo: function(info) {
        if(info.id === undefined) { // 添加
          this.formInfo = {
            key: undefined,
            val: undefined,
            extraVal: undefined,
            description: undefined,
            status: 1,
          };
        }else {
          this.formInfo = {
            id: info.id,
            key: info.key,
            val: info.val,
            extraVal: info.extra_val,
            description: info.description,
            status: info.status,
          };
        }
      },
      commit: function() {
        // 验证
        if(Util.isNullStr(this.formInfo.key)
          || Util.isNullStr(this.formInfo.val)
          || Util.isNullStr(this.formInfo.description)) {
          MSG.error('请输入必填值！');
          return;
        }
        if(this.formInfo.key.length > 64) {
          MSG.error('配置键不得超过 64 位！');
          return;
        }
        // if(this.formInfo.val.length > 1024) {
        //   MSG.error('配置值不得超过 1024 位！');
        //   return;
        // }
        // if(!Util.isNullStr(this.formInfo.extraVal) &&
        //     this.formInfo.extraVal.length > 256) {
        //   MSG.error('备用值不得超过 256 位！');
        //   return;
        // }
        if(this.formInfo.description.length > 128) {
          MSG.error('描述不得超过 128 位！');
          return;
        }

        this.commitLoading = true;

        let promise = this.isEdit ?
          SysConfigLogic.editSysConfig(this.formInfo) :
          SysConfigLogic.addSysConfig(this.formInfo);

        promise.then(rs => {
          if(rs.code === 200) {
            MSG.success('操作成功！');
            // 回调操作
            this.cb && this.cb(true);
          }else {
            MSG.error(rs.message);
          }

          this.commitLoading = false;
        }).catch(() => {
          this.commitLoading = false;
        });
      }
    },
    computed: {
      isEdit: function() {
        return this.formInfo.id;
      }
    },
    components: {
      configStatusSelector,
    },
    created: function() {
      this.setFormInfo(this.data);
    },
    watch: {
      data: function (newVal) {
        this.setFormInfo(newVal);
      }
    }
  }
</script>

