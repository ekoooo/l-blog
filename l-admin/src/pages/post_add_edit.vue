<template>
    <div class="box">
        <div class="box-header">
            <h2 class="title">{{ title }}</h2>
        </div>
        <div class="box-content">
            <el-form
                :model="formInfo"
                ref="form"
                label-width="80px">
                <el-form-item
                    required
                    label="分类">
                    <el-select
                        v-model="formInfo.categoryId"
                        placeholder="请选择分类"
                        size="small">
                        <el-option
                            label="HTML"
                            value="1">
                        </el-option>
                        <el-option
                            label="JS"
                            value="2">
                        </el-option>
                    </el-select>
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
                    <el-select
                        v-model="formInfo.tags"
                        multiple
                        filterable
                        allow-create
                        class="wp5"
                        size="small"
                        placeholder="请选择文章标签">
                        <el-option
                            label="HTML"
                            value="1">
                        </el-option>
                        <el-option
                            label="JS"
                            value="2">
                        </el-option>
                    </el-select>
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
                <div style="padding-left: 80px;">
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
            commit: function () {

            },
            contentOnChange: function({ markdown, html, text }) {
                this.markdown = markdown;
                this.html = html;
                this.text = text;
            },
            descOnChange: function({ html }) {
                this.html = html;
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
        },
    }
</script>
