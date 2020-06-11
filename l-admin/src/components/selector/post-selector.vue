<template>
  <el-select
    filterable
    allow-create
    :loading="loading"
    :multiple="multiple"
    :placeholder="placeholder"
    :value="value"
    :size="size"
    :disabled="disabled"
    @input="change($event)">
    <el-option
      v-if="emptyOption"
      :label="emptyOptionLabel"
      :value="undefined">
    </el-option>
    <el-option
      v-for="item in listData"
      :label="item.title"
      :value="item.id + ''"
      :key="'post_selector_' + item.id">
    </el-option>
  </el-select>
</template>

<script>
  import PostLogic from '../../logic/post';

  export default {
    props: {
      value: {
        'type': Array | Number,
      },
      size: {
        'type': String,
        'default': 'small'
      },
      autoSetFirst: {
        'type': Boolean,
        'default': false
      },
      autoSetFirstCallBack: {
        'type': Function,
        'default': () => {},
      },
      emptyOption: {
        'type': Boolean,
        'default': false
      },
      emptyOptionLabel: {
        'type': String,
        'default': '全部'
      },
      disabled: {
        'type': Boolean,
        'default': false
      },
      multiple: {
        'type': Boolean,
        'default': false
      },
      placeholder: {
        'type': String,
        'default': '请选择文章'
      },
    },
    data: function() {
      return {
        listData: [],
        loading: false,
      };
    },
    methods: {
      change: function(val) {
        this.$emit('input', val);
      },
    },
    created: function() {
      this.loading = true;
      PostLogic.getPostSelectorData().then((data) => {
        this.listData = data.list;
        this.loading = false;

        if(this.autoSetFirst && data.list[0]) {
          this.change(data.list[0].id + '');
          this.autoSetFirstCallBack();
        }
      }).catch((e) => {
        this.loading = false;
        console.error(e);
      });
    }
  }
</script>