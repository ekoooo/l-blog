<template>
    <el-select
        :placeholder="placeholder"
        :multiple="multiple"
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
            v-for="item in categoryList"
            :label="item.name"
            :value="item.id"
            :key="item.id">
        </el-option>
    </el-select>
</template>

<script>
    import PostCategoryLogic from '../../logic/post_category';

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
            multiple: {
                'type': Boolean,
                'default': false
            },
            placeholder: {
                'type': String,
                'default': '请选择分类'
            },
            autoSelectFirst: {
                'type': Boolean,
                'default': false
            }
        },
        data: function() {
            return {
                categoryList: [],
            };
        },
        methods: {
            change: function(val) {
                this.$emit('input', val);
            },
        },
        created: function() {
            PostCategoryLogic.getPostCategorySelector().then((data) => {
                this.categoryList = data.info;

                if(this.autoSelectFirst && data.info.length) {
                    this.$nextTick(() => {
                        this.change(data.info[0].id);
                    })
                }
            });
        }
    }
</script>