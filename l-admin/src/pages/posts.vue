<template>
    <div class="box">
        <div class="box-header">
            <h2 class="title">{{ title }}</h2>
        </div>
        <div class="box-content">
            <div class="table-header clearfix">
                <div class="fl clearfix wp8">
                    <div class="item">
                        <el-popover
                            ref="columnspopover"
                            placement="bottom-start"
                            width="100"
                            trigger="click">
                            <ul>
                                <li v-for="column in columns">
                                    <el-checkbox
                                        v-model="column.show"
                                        :disabled="column.disabled">
                                        {{ column.label }}
                                    </el-checkbox>
                                </li>
                            </ul>
                        </el-popover>
                        <el-button size="small" v-popover:columnspopover>
                            <i class="fa fa-table"></i>
                            <span>配置显示列</span>
                        </el-button>
                    </div>
                    <post-category
                        emptyOption
                        emptyOptionLabel="请选择分类"
                        class="wd8 item"
                        v-model="searchParams.categoryId" />
                    <el-input
                        v-model="searchParams.title"
                        size="small"
                        class="wd12 item"
                        placeholder="请输入标题"></el-input>
                    <el-input
                        v-model="searchParams.tag"
                        size="small"
                        class="wd8 item"
                        placeholder="请输入标签"></el-input>
                    <el-input
                        v-model="searchParams.keyWords"
                        size="small"
                        class="wd8 item"
                        placeholder="请输入关键字"></el-input>
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
                    :border="false"
                    style="width: 100%">
                    <el-table-column
                        v-if="columns['id'].show"
                        :label="columns['id'].label"
                        prop="id"
                        width="60">
                    </el-table-column>
                    <el-table-column
                        v-if="columns['title'].show"
                        :label="columns['title'].label"
                        show-overflow-tooltip
                        prop="title"
                        min-width="2">
                    </el-table-column>
                    <el-table-column
                        v-if="columns['category_name'].show"
                        :label="columns['category_name'].label"
                        prop="category_name"
                        width="100">
                    </el-table-column>
                    <el-table-column
                        v-if="columns['key_words'].show"
                        :label="columns['key_words'].label"
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
                        v-if="columns['tags'].show"
                        :label="columns['tags'].label"
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
                        v-if="columns['comment_check'].show"
                        :label="columns['comment_check'].label"
                        width="70">
                        <template slot-scope="props">
                            {{ props.row['comment_check'] ? '是' : '否' }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        v-if="columns['up_vote'].show"
                        :label="columns['up_vote'].label"
                        prop="up_vote"
                        align="right"
                        width="70">
                    </el-table-column>
                    <el-table-column
                        v-if="columns['down_vote'].show"
                        :label="columns['down_vote'].label"
                        prop="down_vote"
                        align="right"
                        width="70">
                    </el-table-column>
                    <el-table-column
                        v-if="columns['access_count'].show"
                        :label="columns['access_count'].label"
                        prop="access_count"
                        align="right"
                        width="70">
                    </el-table-column>
                    <el-table-column
                        v-if="columns['status'].show"
                        :label="columns['status'].label"
                        :formatter="ColumnFormatter.postStatusFormatter"
                        prop="status"
                        width="70">
                    </el-table-column>
                    <el-table-column
                        v-if="columns['nickname'].show"
                        :label="columns['nickname'].label"
                        prop="nickname"
                        width="120">
                    </el-table-column>
                    <el-table-column
                        v-if="columns['create_time'].show"
                        :label="columns['create_time'].label"
                        width="140">
                        <template slot-scope="props">
                            {{ moment(props.row['create_time']).format('YYYY-MM-DD HH:mm:ss') }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        label="操作"
                        align="center"
                        width="90">
                        <template slot-scope="props">
                            <el-tooltip
                                v-if="props.row.status === 0"
                                class="item" effect="dark" content="删除" placement="top">
                                <i
                                    key="update-status-1"
                                    @click="updateStatus(props.row.id, -1)" class="el-icon-delete red op-icon"></i>
                            </el-tooltip>
                            <router-link
                                v-if="props.row.status === 0"
                                tag="span"
                                :to="{
                                    name: 'postEdit',
                                    params: {
                                        id: props.row.id
                                    }
                                }">
                                <el-tooltip class="item" effect="dark" content="编辑" placement="top">
                                    <i class="el-icon-edit op-icon"></i>
                                </el-tooltip>
                            </router-link>
                            <el-tooltip
                                v-if="props.row.status === 1"
                                class="item" effect="dark" content="撤回" placement="top">
                                <i
                                    key="update-status-2"
                                    @click="updateStatus(props.row.id, 0)" class="el-icon-remove-outline op-icon"></i>
                            </el-tooltip>
                            <el-tooltip
                                v-if="props.row.status === 0"
                                class="item" effect="dark" content="发布" placement="top">
                                <i
                                    key="update-status-3"
                                    @click="updateStatus(props.row.id, 1)" class="el-icon-circle-check-outline op-icon"></i>
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
    import PostLogic from '../logic/post';
    import MSG from '../utils/message';
    import moment from 'moment';
    import ColumnFormatter from '../common/column_formatter';
    import postCategory from '../components/selector/post-category';

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
                ColumnFormatter,

                columns: {
                    id: {
                        label: 'ID',
                        show: true,
                        disabled: true,
                    },
                    title: {
                        label: '标题',
                        show: true,
                    },
                    category_name: {
                        label: '分类名',
                        show: true,
                    },
                    key_words: {
                        label: '关键字',
                        show: false,
                    },
                    tags: {
                        label: '标签',
                        show: false,
                    },
                    comment_check: {
                        label: '评论审核',
                        show: true,
                    },
                    up_vote: {
                        label: '点赞数',
                        show: true,
                    },
                    down_vote: {
                        label: '反对数',
                        show: true,
                    },
                    access_count: {
                        label: '访问数',
                        show: true,
                    },
                    status: {
                        label: '状态',
                        show: true,
                    },
                    nickname: {
                        label: '添加人',
                        show: true,
                    },
                    create_time: {
                        label: '添加时间',
                        show: true,
                    },
                },
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
            /**
             * 更新状态
             * @param id
             * @param status
             */
            updateStatus(id, status) {
                console.log(status);

                MSG.warningConfirm('是否确定' + ({ '1': '发布', '0': '撤回', '-1': '删除' })[status] + '?').then(confirm => {
                    if(!confirm) { return; }

                    PostLogic.updateStatus(id, status).then(rs => {
                        if(rs.code === 200) {
                            MSG.success('操作成功');
                            this.refreshCurrentPage();
                        }else {
                            MSG.error(rs.message);
                        }
                    });
                });
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
            postCategory
        },
        created: function() {
            this.search();
        }
    }
</script>
