<template>
  <el-select
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
      label="Like"
      :value="1">
    </el-option>
    <el-option
      label="Unlike"
      :value="-1">
    </el-option>
  </el-select>
</template>

<script>
  export default {
    props: {
      value: {
        'type': Number,
      },
      size: {
        'type': String,
        'default': 'small'
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
      placeholder: {
        'type': String,
        'default': 'Like/Unlike'
      },
    },
    methods: {
      change: function(val) {
        this.$emit('input', val);
      },
    },
  }
</script>