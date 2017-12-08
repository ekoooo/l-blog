<template>
    <div class="box">
        <div class="box-header">
            <h2 class="title">{{ title }}</h2>
        </div>
        <div class="box-content">
            <div class="table-header clearfix">
                <div class="fl clearfix wp8">
                    <el-input
                        v-model="searchParams.title"
                        size="small"
                        class="wd12 item"
                        placeholder="请输入标题"></el-input>
                    <el-input
                        v-model="searchParams.categoryName"
                        size="small"
                        class="wd8 item"
                        placeholder="请输入分类"></el-input>
                    <el-input
                        v-model="searchParams.keyWords"
                        size="small"
                        class="wd8 item"
                        placeholder="请输入关键字"></el-input>
                    <el-input
                        v-model="searchParams.tag"
                        size="small"
                        class="wd8 item"
                        placeholder="请输入标签"></el-input>
                    <el-input
                        v-model="searchParams.text"
                        size="small"
                        class="wd15 item"
                        placeholder="请输入内容"></el-input>
                    <el-button
                        :loading="listLoading"
                        @click="search"
                        type="primary"
                        size="small"
                        class="item"
                        icon="el-icon-search">搜索</el-button>
                    <span>
                        <el-button
                            @click="resetSearchFrom"
                            type="success"
                            size="small"
                            class="item"
                            icon="el-icon-delete">重置</el-button>
                    </span>
                </div>
                <div class="fr">
                    <router-link
                        :to="{ name: 'postAdd' }">
                        <el-button
                            size="small"
                            class="item"
                            icon="el-icon-plus">添加文章</el-button>
                    </router-link>
                </div>
            </div>
            <div v-loading="listLoading" class="table-body">
                <el-table
                    :data="listData"
                    :stripe="true"
                    :border="true"
                    style="width: 100%">
                    <el-table-column
                        prop="id"
                        label="ID"
                        width="60">
                    </el-table-column>
                    <el-table-column
                        show-overflow-tooltip
                        prop="title"
                        label="标题"
                        min-width="2">
                    </el-table-column>
                    <el-table-column
                        prop="category_name"
                        label="分类名"
                        width="100">
                    </el-table-column>
                    <el-table-column
                        label="关键字"
                        min-width="1">
                        <template slot-scope="props">
                            <el-tag
                                v-for="item in props.row['key_words'].split(',')"
                                style="margin-left: 4px;"
                                type="success"
                                size="mini"
                                :key="item">
                                {{ item }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column
                        label="标签"
                        min-width="1">
                        <template slot-scope="props">
                            <el-tag
                                v-for="item in props.row['tags'].split(',')"
                                style="margin-left: 4px;"
                                type="warning"
                                size="mini"
                                :key="item">
                                {{ item }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column
                        label="评论审核"
                        width="70">
                        <template slot-scope="props">
                            {{ props.row['comment_check'] ? '是' : '否' }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="up_vote"
                        label="点赞数"
                        align="right"
                        width="70">
                    </el-table-column>
                    <el-table-column
                        prop="down_vote"
                        label="反对数"
                        align="right"
                        width="70">
                    </el-table-column>
                    <el-table-column
                        prop="access_count"
                        label="访问数"
                        align="right"
                        width="70">
                    </el-table-column>
                    <el-table-column
                        prop="username"
                        label="添加人"
                        width="80">
                    </el-table-column>
                    <el-table-column
                        label="添加时间"
                        width="140">
                        <template slot-scope="props">
                            {{ moment(props.row['create_time']).format('YYYY-MM-DD HH:mm:ss') }}
                        </template>
                    </el-table-column>
                </el-table>
                <div class="table-pagination clearfix">
                    <div class="fr">
                        <el-pagination
                            background
                            @current-change="handleCurrentChange"
                            :current-page.sync="currentPage"
                            :page-size="pageSize"
                            :total="totalCount"
                            layout="total, prev, pager, next, jumper">
                        </el-pagination>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import PostLogic from '../logic/post';
    import MSG from '../utils/message';
    import moment from 'moment';

    export default {
        data: function() {
            return {
                searchParams: Object.assign({}, PostLogic.POST_LIST_SEARCHPARAMS),
                listData: [],
                pageId: 0, // 当前页码（从 0 开始计算第一页）
                pageSize: PostLogic.PAGE_SIZE, // 一页显示多少天记录
                totalCount: 0, // 总共多少条记录
                listLoading: false, // 表格数据加载中标志

                moment,
            };
        },
        methods: {
            getList: function(searchParams) {
                this.listLoading = true;

                PostLogic.getPostList(searchParams).then((rs) => {
                    if (rs.code === 200) {
                        this.listData = rs.list;
                        this.pageId = rs.pageId;
                        this.totalCount = rs.totalCount;
                    }else {
                        MSG.error(rs.message);
                    }

                    this.listLoading = false;
                }).catch(() => { this.listLoading = false; });
            },
            search: function() {
                this.listLoading = true;

                this.getList({
                    pageId: 0,
                    q: {
                        ...this.searchParams
                    }
                });
            },
            handleCurrentChange: function(pageId) {
                this.getList({
                    pageId: pageId - 1,
                    q: {
                        ...this.searchParams
                    }
                });
            },
            refreshCurrentPage: function() {
                this.getList({
                    pageId: this.pageId,
                    q: {
                        ...this.searchParams
                    }
                });
            },
            resetSearchFrom: function() {
                this.searchParams = Object.assign({}, PostLogic.POST_LIST_SEARCHPARAMS);
            },
        },
        components: {

        },
        computed: {
            currentPage: {
                get: function() {
                    return this.pageId + 1;
                },
                set: function (val) {

                }
            },
            title: function() {
                return this.$route.meta.title;
            }
        },
        created: function() {
            this.search();
        }
    }
</script>
