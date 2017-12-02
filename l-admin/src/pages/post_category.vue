<template>
    <div class="box">
        <el-dialog
            width="40%"
            :title="itemData ? '编辑分类' : '添加分类'"
            :visible.sync="addEditDialogVisible">
            <post-category-add-editor-modal
                :data="itemData"
                :cb="addEditCb"
            />
        </el-dialog>

        <div class="box-header">
            <h2 class="title">{{ title }}</h2>
        </div>
        <div class="box-content">
            <div class="table-header clearfix">
                <div class="fl clearfix wp8">
                    <el-input
                        v-model="searchParams.postCategoryName"
                        size="small"
                        class="wd10 item"
                        placeholder="请输入分类名称" ></el-input>
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
                    <el-button
                        @click="openAddEditDialog(null)"
                        size="small"
                        class="item"
                        icon="el-icon-plus">添加分类</el-button>
                </div>
            </div>
            <div v-loading="listLoading" class="table-body">
                <el-table
                    :data="listData"
                    :stripe="true"
                    :border="false"
                    style="width: 100%">
                    <el-table-column
                        prop="id"
                        label="ID"
                        width="180">
                    </el-table-column>
                    <el-table-column
                        prop="name"
                        label="分类名称"
                        width="180">
                    </el-table-column>
                    <el-table-column
                        prop="create_time"
                        label="添加时间">
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
    import postCategoryAddEditorModal from '../components/operation/post-category-add-editor-modal';
    import PostCategoryLogic from '../logic/post_category';
    import MSG from '../utils/message';
    import moment from 'moment';

    export default {
        data: function() {
            return {
                searchParams: Object.assign({}, PostCategoryLogic.POST_CATEGORY_LIST_SEARCHPARAMS),
                listData: [],
                pageId: 0, // 当前页码（从 0 开始计算第一页）
                pageSize: PostCategoryLogic.PAGE_SIZE, // 一页显示多少天记录
                totalCount: 0, // 总共多少条记录

                listLoading: false, // 表格数据加载中标志
                addEditDialogVisible: false,
                itemData: null,

                moment,
            };
        },
        methods: {
            getList: function(searchParams) {
                this.listLoading = true;

                PostCategoryLogic.getPostCategoryList(searchParams).then((rs) => {
                    if (rs.code === 200) {
                        this.listData = rs.list;
                        this.pageId = rs.pageId;
                        this.totalCount = rs.totalCount;
                    }else {
                        MSG.error(rs.message);
                    }

                    this.listLoading = false;
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
                this.searchParams = Object.assign({}, PostCategoryLogic.POST_CATEGORY_LIST_SEARCHPARAMS);
            },

            /**
             * 打开添加编辑 Modal
             * @param itemData 编辑时原数据，添加可不传入
             */
            openAddEditDialog: function(itemData) {
                this.itemData = itemData;
                this.addEditDialogVisible = true;
            },
            /**
             * 添加编辑操作之后回调函数
             * @param refresh 是否需要刷新列表
             */
            addEditCb: function(refresh) {
                if(refresh) {
                    this.refreshCurrentPage();
                }

                this.addEditDialogVisible = false;
            }
        },
        components: {
            postCategoryAddEditorModal,
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
