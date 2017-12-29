<template>
    <div class="box">
        <el-dialog
            title="查看留言"
            :visible.sync="viewItemVisiable">
            <comment-info
                :loading="viewItemLoading"
                :data="itemInfo"
            />
        </el-dialog>
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
                        class="wd4 item"
                        placeholder="文章 ID"></el-input>
                    <el-input
                        v-model="searchParams.mail"
                        size="small"
                        class="wd8 item"
                        placeholder="作者邮箱"></el-input>
                    <el-input
                        v-model="searchParams.authorSite"
                        size="small"
                        class="wd10 item"
                        placeholder="作者网址"></el-input>
                    <comment-status-selector
                        v-model="searchParams.status"
                        size="small"
                        class="wd6 item"
                        emptyOption
                        emptyOptionLabel="留言状态"
                    />
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
                        v-if="columns['id'].show"
                        :label="columns['id'].label"
                        prop="id"
                        width="70">
                    </el-table-column>
                    <el-table-column
                        v-if="columns['post_id'].show"
                        :label="columns['post_id'].label"
                        prop="post_id"
                        width="70">
                    </el-table-column>
                    <el-table-column
                        v-if="columns['post_title'].show"
                        :label="columns['post_title'].label"
                        prop="post_title"
                        show-overflow-tooltip>
                    </el-table-column>
                    <el-table-column
                        v-if="columns['author'].show"
                        :label="columns['author'].label"
                        prop="author"
                        width="120">
                    </el-table-column>
                    <el-table-column
                        v-if="columns['mail'].show"
                        :label="columns['mail'].label"
                        prop="mail"
                        width="180">
                    </el-table-column>
                    <el-table-column
                        v-if="columns['author_site'].show"
                        :label="columns['author_site'].label"
                        prop="author_site"
                        width="200">
                    </el-table-column>
                    <el-table-column
                        v-if="columns['create_ip'].show"
                        :label="columns['create_ip'].label"
                        prop="create_ip"
                        width="150">
                    </el-table-column>
                    <el-table-column
                        v-if="columns['status'].show"
                        :label="columns['status'].label"
                        :formatter="ColumnFormatter.commentStatusFormatter"
                        prop="status"
                        width="70">
                    </el-table-column>
                    <el-table-column
                        v-if="columns['create_time'].show"
                        :label="columns['create_time'].label"
                        :formatter="ColumnFormatter.timeFormatter"
                        prop="create_time"
                        width="140">
                    </el-table-column>
                    <el-table-column
                        label="操作"
                        align="center"
                        width="90">
                        <template slot-scope="props">
                            <!-- 未审核状态可删除和通过审核 -->
                            <!-- 审核状态可删除 -->
                            <!-- 删除可恢复 -->
                            <el-tooltip
                                v-if="props.row.status !== -1"
                                class="item"
                                effect="dark"
                                content="删除"
                                placement="top">
                                <i
                                    @click="updateStatus(props.row.id, 2)"
                                    :key="'btn-1-' + props.row.id"
                                    class="el-icon-delete red op-icon"></i>
                            </el-tooltip>
                            <el-tooltip
                                v-if="props.row.status === -1"
                                class="item"
                                effect="dark"
                                content="恢复"
                                placement="top">
                                <i
                                    @click="updateStatus(props.row.id, 1)"
                                    :key="'btn-2-' + props.row.id"
                                    class="el-icon-time op-icon"></i>
                            </el-tooltip>
                            <el-tooltip
                                v-if="props.row.status === 0"
                                class="item"
                                effect="dark"
                                content="通过审核"
                                placement="top">
                                <i
                                    @click="updateStatus(props.row.id, 3)"
                                    :key="'btn-3-' + props.row.id"
                                    class="el-icon-check op-icon"></i>
                            </el-tooltip>
                            <el-tooltip
                                class="item"
                                effect="dark"
                                content="查看"
                                placement="top">
                                <i
                                    @click="viewItem(props.row.id)"
                                    :key="'btn-4-' + props.row.id"
                                    class="el-icon-view op-icon">
                                </i>
                            </el-tooltip>
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
    import CommentLigic from '../logic/comment';
    import MSG from '../utils/message';
    import ColumnFormatter from '../common/column_formatter';
    import columnsToggler from '../components/operation/columns-toggler';
    import commentStatusSelector from '../components/selector/comment-status';
    import commentInfo from '../components/view/comment-info';

    export default {
        data: function () {
            return {
                searchParams: Object.assign({}, CommentLigic.COMMENT_LIST_SEARCH_PARAMS),
                listData: [],
                pageId: 0, // 当前页码（从 0 开始计算第一页）
                pageSize: CommentLigic.PAGE_SIZE, // 一页显示多少天记录
                totalCount: 0, // 总共多少条记录
                listLoading: false, // 表格数据加载中标志

                itemInfo: {

                },
                viewItemLoading: false,
                viewItemVisiable: false,

                ColumnFormatter,

                columns: {
                    id: {
                        label: 'ID',
                        show: false,
                    },
                    post_id: {
                        label: '文章 ID',
                        show: false,
                    },
                    post_title: {
                        label: '文章标题',
                        show: true,
                        disabled: true,
                    },
                    author: {
                        label: '作者',
                        show: true,
                    },
                    mail: {
                        label: '作者邮箱',
                        show: true,
                    },
                    author_site: {
                        label: '作者网址',
                        show: true,
                    },
                    create_ip: {
                        label: '回复 IP',
                        show: true,
                    },
                    status: {
                        label: '状态',
                        show: true,
                    },
                    create_time: {
                        label: '回复时间',
                        show: true,
                    },
                },
            };
        },
        methods: {
            getList: function(searchParams) {
                this.listLoading = true;

                CommentLigic.getCommentList(searchParams).then((rs) => {
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
                this.searchParams = Object.assign({}, CommentLigic.COMMENT_LIST_SEARCH_PARAMS);
            },

            /**
             * 更新状态
             * @param id
             * @param type
             */
            updateStatus: function(id, type) {
                let status;
                let msg;

                if(type === 1) {
                    status = 1;
                    msg = '是否确定恢复？';
                }else if(type === 2) {
                    status = -1;
                    msg = '是否确定删除？';
                }else if(type === 3) {
                    status = 1;
                    msg = '是否确定通过审核？';
                }

                MSG.warningConfirm(msg).then(confirm => {
                    if(!confirm) { return; }

                    CommentLigic.updateStatus(id, status).then(rs => {
                        if(rs.code === 200) {
                            MSG.success('操作成功');
                            this.refreshCurrentPage();
                        }else {
                            MSG.error(rs.message);
                        }
                    });
                });
            },

            /**
             * 查看留言
             * @param id
             */
            viewItem: function (id) {
                this.viewItemLoading = true;
                this.viewItemVisiable = true;

                CommentLigic.getCommentById(id).then(data => {
                    if(data.code === 200) {
                        this.itemInfo = data.info;
                    }else {
                        MSG.error(data.message);
                    }
                    this.viewItemLoading = false;
                }).catch(() => {
                    this.viewItemLoading = false;
                });
            }
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
            commentStatusSelector,
            commentInfo,
        },
        created: function() {
            this.search();
        }
    }

</script>