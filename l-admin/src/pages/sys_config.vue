<template>
    <div>
        <el-dialog
            width="40%"
            :title="itemData && itemData.id ? '编辑配置' : '添加配置'"
            :visible.sync="addEditDialogVisible">
            <sys-config-add-edit-model
                :data="itemData"
                :cb="addEditCb"
            />
        </el-dialog>
        <div class="table-header clearfix">
            <div class="fl clearfix wp8">
                <columns-toggler :columns="columns" clazz="item" />
                <el-input
                    v-model="searchParams.key"
                    size="small"
                    class="wd8 item"
                    placeholder="配置键"></el-input>
                <el-input
                    v-model="searchParams.val"
                    size="small"
                    class="wd10 item"
                    placeholder="配置值"></el-input>
                <el-input
                    v-model="searchParams.description"
                    size="small"
                    class="wd12 item"
                    placeholder="描述"></el-input>
                <config-status-selector
                    v-model="searchParams.status"
                    size="small"
                    class="wd6 item"
                    emptyOption
                    emptyOptionLabel="配置状态"
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
            <div class="fr">
                <el-button
                    @click="openAddEditDialog(null)"
                    size="small"
                    class="item"
                    icon="el-icon-plus">添加配置</el-button>
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
                    v-if="columns['key'].show"
                    :label="columns['key'].label"
                    prop="key">
                </el-table-column>
                <el-table-column
                    v-if="columns['val'].show"
                    :label="columns['val'].label"
                    prop="val"
                    show-overflow-tooltip
                    width="250">
                </el-table-column>
                <el-table-column
                    v-if="columns['extra_val'].show"
                    :label="columns['extra_val'].label"
                    prop="extra_val"
                    show-overflow-tooltip
                    width="250">
                </el-table-column>
                <el-table-column
                    v-if="columns['description'].show"
                    :label="columns['description'].label"
                    prop="description"
                    width="180">
                </el-table-column>
                <el-table-column
                    v-if="columns['status'].show"
                    :label="columns['status'].label"
                    :formatter="ColumnFormatter.configStatusFormatter"
                    prop="status"
                    width="60">
                </el-table-column>
                <el-table-column
                    v-if="columns['create_time'].show"
                    :label="columns['create_time'].label"
                    :formatter="ColumnFormatter.timeFormatter"
                    width="140">
                </el-table-column>
                <el-table-column
                    label="操作"
                    align="center"
                    width="80">
                    <template slot-scope="props">
                        <i class="el-icon-edit op-icon" @click="openAddEditDialog(props.row)"></i>
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
</template>

<script>
    import SysConfigLogic from '../logic/sys_config';
    import MSG from '../utils/message';
    import Util from '../utils/util';
    import ColumnFormatter from '../common/column_formatter';
    import columnsToggler from '../components/operation/columns-toggler';
    import configStatusSelector from '../components/selector/config-status';
    import sysConfigAddEditModel from '../components/operation/sys-config-add-edit-model';

    export default {
        data: function () {
            return {
                searchParams: Object.assign({}, SysConfigLogic.CONFIG_LIST_SEARCHPARAMS),
                listData: [],
                pageId: 0, // 当前页码（从 0 开始计算第一页）
                pageSize: SysConfigLogic.CONFIG_LIST_PAGE_SIZE, // 一页显示多少天记录
                totalCount: 0, // 总共多少条记录

                ColumnFormatter,

                activeTab: '1',
                listLoading: false,

                addEditDialogVisible: false,
                itemData: null,

                columns: {
                    id: {
                        label: 'ID',
                        show: false,
                    },
                    key: {
                        label: '配置键',
                        show: true,
                        disabled: true
                    },
                    val: {
                        label: '配置值',
                        show: true,
                        disabled: true
                    },
                    extra_val: {
                        label: '备用值',
                        show: true,
                    },
                    description: {
                        label: '描述',
                        show: true,
                    },
                    create_time: {
                        label: '添加时间',
                        show: false,
                    },
                    status: {
                        label: '状态',
                        show: false,
                    },

                },
            };
        },
        methods: {
            getList: function (searchParams) {
                this.listLoading = true;

                SysConfigLogic.getSysConfigList(searchParams).then((rs) => {
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
                this.searchParams = Object.assign({}, SysConfigLogic.CONFIG_LIST_SEARCHPARAMS);
            },

            /**
             * 打开添加编辑 Modal
             * @param itemData 编辑时原数据，添加可不传入
             */
            openAddEditDialog: function(itemData) {
                this.itemData = {...itemData, t: +new Date()};
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
        computed: {
            title: function() {
                return this.$route.meta.title;
            },
            currentPage: {
                get: function() {
                    return this.pageId + 1;
                },
                set: function (val) {

                }
            }
        },
        components: {
            columnsToggler,
            configStatusSelector,
            sysConfigAddEditModel,
        },
        created: function () {
            this.search();
        }
    }
</script>
