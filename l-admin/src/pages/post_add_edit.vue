<template>
    <div class="box">
        <div class="box-header clearfix">
            <h2 class="title fl">{{ title }}</h2>
            <div class="fr">
                <el-button
                    size="mini"
                    type="primary"
                    @click.native="commit"
                    :icon="isEdit ? 'el-icon-edit' : 'el-icon-plus'"
                    :loading="commitLoading">
                    {{ isEdit ? '保存' : '添加' }}
                </el-button>
                <el-button
                    size="mini"
                    icon="el-icon-back"
                    @click.native="goBack"
                    :loading="commitLoading">
                    返回
                </el-button>
            </div>
        </div>
        <div class="box-content">
            <el-form
                :model="formInfo"
                ref="form"
                label-width="100px">
                <el-form-item
                    required
                    label="分类">
                    <post-category
                        v-model="formInfo.categoryId"
                        :auto-select-first="true"
                    />
                </el-form-item>
                <el-form-item
                    required
                    label="标题">
                    <el-input
                        v-model="formInfo.title"
                        class="wp5"
                        placeholder="请输入文章标题"
                        size="small"></el-input>
                </el-form-item>
                <el-form-item
                    required
                    label="标签">
                    <post-tag v-model="formInfo.tags" class="wp5" />
                </el-form-item>
                <el-form-item
                    required
                    label="内容">
                    <div style="margin-top: 12px;">
                        <markdown-editor
                            editor-id="post-content-editor"
                            :onchange="contentOnChange"
                            :config="{
                                placeholder: '请输入文章内容'
                            }"
                        />
                    </div>
                </el-form-item>
                <el-form-item
                    required
                    label="简述">
                    <div style="margin-top: 12px;">
                        <markdown-editor
                            editor-id="post-desc-editor"
                            :onchange="descOnChange"
                            :config="{
                                height: 120,
                                toolbar: false,
                                placeholder: '请输入简介'
                            }"
                        />
                    </div>
                </el-form-item>
                <el-form-item
                    required
                    label="关键字">
                    <el-input
                        v-model="formInfo.keyWords"
                        class="wp5"
                        placeholder="英文逗号隔开"
                        size="small"></el-input>
                </el-form-item>
                <el-form-item
                    required
                    label="评论审核">
                    <el-switch
                        v-model="formInfo.commentCheck"
                        size="small"></el-switch>
                </el-form-item>
                <div style="padding-left: 100px;">
                    <el-button
                        size="small"
                        type="primary"
                        @click.native="commit"
                        :icon="isEdit ? 'el-icon-edit' : 'el-icon-plus'"
                        :loading="commitLoading">
                        {{ isEdit ? '保存' : '添加' }}
                    </el-button>
                    <el-button
                        size="small"
                        icon="el-icon-back"
                        @click.native="goBack"
                        :loading="commitLoading">
                        返回
                    </el-button>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script>
    import markdownEditor from '../components/operation/markdown-editor';
    import postCategory from '../components/selector/post-category';
    import postTag from '../components/selector/post-tag';
    import MSG from '../utils/message';
    import Util from '../utils/util';
    import PostLogic from '../logic/post';

    export default {
        data: function () {
            return {
                formInfo: {
                    title: undefined, // 标题
                    categoryId: undefined, // 分类
                    tags: [], // 标签
                    markdown: undefined, // 内容 markdown
                    html: undefined, // 内容 html
                    text: undefined, // 内容 text
                    desc: undefined, // 简述
                    commentCheck: false, // 评论是否需审核
                    keyWords: undefined, // 关键字
                },

                commitLoading: false,
            };
        },
        methods: {
            goBack: function () {
                this.$router.go(-1);
            },
            validForm: function () {
                if(Util.isNullStr(this.formInfo.title)
                    || this.formInfo.tags.length === 0
                    || Util.isNullStr(this.formInfo.markdown)
                    || Util.isNullStr(this.formInfo.desc)
                    || Util.isNullStr(this.formInfo.keyWords)) {
                    return '请输入必填项';
                }

                return false;
            },
            commit: function () {
                let errMsg = this.validForm();
                if(errMsg) {
                    MSG.error(errMsg);
                }

                let promise = this.isEdit ?
                    PostLogic.editPost(this.$route.params['id'], this.formInfo) :
                    PostLogic.addPost(this.formInfo);

                this.commitLoading = true;
                promise.then(rs => {
                    if(rs.code === 200) {
                        MSG.success(this.isEdit ? '保存成功' : '添加成功');
                        this.goBack();
                    }else {
                        MSG.error(rs.message);
                    }

                    this.commitLoading = false;
                }).catch(() => {
                    this.commitLoading = false;
                });
            },
            contentOnChange: function({ markdown, html, text }) {
                this.formInfo.markdown = markdown;
                this.formInfo.html = html;
                this.formInfo.text = text;
            },
            descOnChange: function({ html }) {
                this.formInfo.desc = html;
            },
        },
        computed: {
            title: function() {
                return this.$route.meta.title;
            },
            isEdit: function () {
                return this.$route.name === 'postEdit';
            },
        },
        components: {
            markdownEditor,
            postCategory,
            postTag,
        },
    }
</script>
