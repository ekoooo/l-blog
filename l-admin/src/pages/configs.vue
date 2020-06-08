<template>
  <div class="box">
    <div class="box-header">
      <h2 class="title">{{ title }}</h2>
    </div>
    <div class="box-content">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="系统配置" name="1">
          <sys-config />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
  import sysConfig from './sys_config';

  export default {
    data: function() {
      return {
        activeTab: '1',
      };
    },
    methods: {
      onchange: function (info) {

      }
    },
    computed: {
      title: function() {
        return this.$route.meta.title;
      }
    },
    components: {
      sysConfig,
    },
  }
</script>
