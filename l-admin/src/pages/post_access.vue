<template>
    <div class="box">
        <div class="box-header">
            <h2 class="title">{{ title }}</h2>
        </div>
        <div class="box-content">
            <div class="table-header clearfix">
                <div class="fl clearfix wp8">
                    <columns-toggler :columns="columns" clazz="item" />
                    <el-input
                        v-model="searchParams.postId"
                        size="small"
                        class="wd5 item"
                        placeholder="文章 ID"></el-input>
                    <el-input
                        v-model="searchParams.title"
                        size="small"
                        class="wd12 item"
                        placeholder="请输入标题"></el-input>
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
            </div>
            <div v-loading="listLoading" class="table-body">
                <el-table
                    :data="listData"
                    :stripe="true"
                    :border="false"
                    style="width: 100%">
                    <el-table-column
                        v-if="columns['post_id'].show"
                        :label="columns['post_id'].label"
                        prop="post_id"
                        width="80">
                    </el-table-column>
                    <el-table-column
                        v-if="columns['title'].show"
                        :label="columns['title'].label"
                        prop="title"
                        show-overflow-tooltip>
                    </el-table-column>
                    <el-table-column
                        v-if="columns['nickname'].show"
                        :label="columns['nickname'].label"
                        prop="nickname"
                        width="120">
                    </el-table-column>
                    <el-table-column
                        v-if="columns['create_ip'].show"
                        :label="columns['create_ip'].label"
                        prop="create_ip"
                        width="150">
                    </el-table-column>
                    <el-table-column
                        v-if="columns['create_time'].show"
                        :label="columns['create_time'].label"
                        :formatter="ColumnFormatter.timeFormatter"
                        prop="create_time"
                        width="140">
                    </el-table-column>
                    <el-table-column
                        v-if="columns['user_agent'].show"
                        :label="columns['user_agent'].label"
                        prop="user_agent"
                        show-overflow-tooltip
                        width="500">
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
    import PostAccessLigic from '../logic/post_access';
    import MSG from '../utils/message';
    import ColumnFormatter from '../common/column_formatter';
    import columnsToggler from '../components/operation/columns-toggler';

    export default {
        data: function () {
            return {
                searchParams: Object.assign({}, PostAccessLigic.ACCESS_LIST_SEARCH_PARAMS),
                listData: [],
                pageId: 0, // 当前页码（从 0 开始计算第一页）
                pageSize: PostAccessLigic.PAGE_SIZE, // 一页显示多少天记录
                totalCount: 0, // 总共多少条记录
                listLoading: false, // 表格数据加载中标志

                ColumnFormatter,

                columns: {
                    post_id: {
                        label: '文章 ID',
                        show: false,
                    },
                    title: {
                        label: '文章标题',
                        show: true,
                        disabled: true,
                    },
                    nickname: {
                        label: '作者',
                        show: true,
                    },
                    create_ip: {
                        label: '访问 IP',
                        show: true,
                    },
                    create_time: {
                        label: '访问时间',
                        show: true,
                    },
                    user_agent: {
                        label: 'User Agent',
                        show: true,
                    },
                },
            };
        },
        methods: {
            getList: function(searchParams) {
                this.listLoading = true;

                PostAccessLigic.getAccessList(searchParams).then((rs) => {
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
                this.searchParams = Object.assign({}, PostAccessLigic.ACCESS_LIST_SEARCH_PARAMS);
            },
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
        components: {
            columnsToggler,
        },
        created: function() {
            this.search();
        }
    }

</script>