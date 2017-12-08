<template>
    <el-select
        multiple
        filterable
        allow-create
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
            v-for="item in tagList"
            :label="item.name"
            :value="item.name"
            :key="item.name">
        </el-option>
    </el-select>
</template>

<script>
    import PostTagLogic from '../../logic/post_tag';

    export default {
        props: {
            value: {
                'type': Array,
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
                'default': '请选择文章标签'
            },
        },
        data: function() {
            return {
                tagList: [],
            };
        },
        methods: {
            change: function(val) {
                this.$emit('input', val);
            },
        },
        created: function() {
            PostTagLogic.getPostTagSelector().then((data) => {
                this.tagList = data.info;
            });
        }
    }
</script>