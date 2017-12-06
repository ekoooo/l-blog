<template>
    <div>
        <el-form
            :model="formInfo"
            ref="form"
            label-width="100px"
            @submit.native.prevent>
            <el-form-item
                required
                label="分类名称">
                <el-input
                    v-model="formInfo.postCategoryName"
                    @keyup.enter.native="commit"
                    class="wd10"
                    placeholder="请输入分类名称"
                    size="small"></el-input>
            </el-form-item>
            <div style="padding-left: 100px;">
                <el-button
                    size="small"
                    type="primary"
                    @click.native="commit"
                    :loading="commitLoading">
                    <i
                        class="fa"
                        :class="!!formInfo.postCategoryId ? 'fa-edit' : 'fa-plus'"></i>
                    {{ !this.isEdit ? '保存' : '添加' }}
                </el-button>
            </div>
        </el-form>
    </div>
</template>

<script>
    import MSG from '../../utils/message';
    import PostCategoryLogic from '../../logic/post_category';

    export default {
        props: ['data', 'cb'],
        data: function () {
            return {
                formInfo: {
                    postCategoryId: undefined,
                    postCategoryName: undefined,
                    t: undefined, // 用于监听该变量是否改变，清除输入框遗留内容
                },
                commitLoading: false,
            };
        },
        methods: {
            setFormInfo: function(info) {
                if(info === null) { // 添加
                    this.formInfo = {
                        postCategoryName: undefined,
                    };
                }else {
                    this.formInfo = {
                        postCategoryId: info.id,
                        postCategoryName: info.name,
                    };
                }
            },
            commit: function() {
                this.commitLoading = true;

                let promise = this.isEdit ?
                    PostCategoryLogic.editPostCategory(this.formInfo) :
                    PostCategoryLogic.addPostCategory(this.formInfo);

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
            },
        },
        computed: {
            isEdit: function() {
                return this.formInfo.postCategoryId;
            }
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