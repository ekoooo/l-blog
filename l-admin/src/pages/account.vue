<template>
  <div class="box">
    <el-dialog
      width="40%"
      :title="updatePwdInfo.nickname + ' 修改密码'"
      :visible.sync="updatePwdDialogVisiable">

      <el-form
        :model="updatePwdInfo"
        ref="form"
        label-width="100px"
        @submit.native.prevent>
        <el-form-item
          required
          label="请输入密码">
          <el-input
            v-model="updatePwdInfo.pwd"
            class="wd12"
            type="password"
            :maxlength="16"
            placeholder="6 ~ 16 位"
            size="small"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            size="small"
            type="primary"
            @click.native="updatePwd"
            :icon="'el-icon-edit'"
            :loading="updatePwdCommitLoading">
            确定修改
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <div class="box-header">
      <h2 class="title">{{ title }}</h2>
    </div>
    <div class="box-content">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="管理员账号" name="1" v-loading="listLoading">
          <div class="table-header clearfix">
            <div class="fl clearfix wp8">
              <columns-toggler :columns="columns" clazz="item" />
              <el-input
                v-model="searchParams.username"
                size="small"
                class="wd8 item"
                placeholder="请输入用户名"></el-input>
              <el-input
                v-model="searchParams.nickname"
                size="small"
                class="wd12 item"
                placeholder="请输入昵称"></el-input>
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
                :to="{ name: 'account' }">
                <el-button
                  size="small"
                  class="item"
                  icon="el-icon-plus">添加管理员</el-button>
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
                v-if="columns['username'].show"
                :label="columns['username'].label"
                prop="username"
                width="100">
              </el-table-column>
              <el-table-column
                v-if="columns['phone'].show"
                :label="columns['phone'].label"
                prop="phone"
                width="120">
              </el-table-column>
              <el-table-column
                v-if="columns['nickname'].show"
                :label="columns['nickname'].label"
                prop="nickname">
              </el-table-column>
              <el-table-column
                v-if="columns['gender'].show"
                :label="columns['gender'].label"
                :formatter="ColumnFormatter.userGenderFormatter"
                prop="gender"
                width="60">
              </el-table-column>
              <el-table-column
                v-if="columns['age'].show"
                :label="columns['age'].label"
                prop="age"
                width="60">
              </el-table-column>
              <el-table-column
                v-if="columns['mail'].show"
                :label="columns['mail'].label"
                prop="mail"
                width="160">
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
                :formatter="ColumnFormatter.userStatusFormatter"
                prop="status"
                width="60">
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
                prop="create_time"
                :formatter="ColumnFormatter.timeFormatter"
                width="140">
              </el-table-column>
              <el-table-column
                label="操作"
                width="80">
                <template slot-scope="props">
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="修改密码"
                    placement="top">
                    <i
                      :key="'btn-1-' + props.row.id"
                      @click="openUpdatePwdDialog(props.row)"
                      class="fa fa-key op-icon red"></i>
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
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
  import UsersLogic from '../logic/users';
  import OauthLogic from '../logic/oauth';
  import MSG from '../utils/message';
  import Util from '../utils/util';
  import ColumnFormatter from '../common/column_formatter';
  import columnsToggler from '../components/operation/columns-toggler';

  export default {
    data: function () {
      return {
        searchParams: Object.assign({}, UsersLogic.ADMIN_LIST_SEARCHPARAMS),
        listData: [],
        pageId: 0, // 当前页码（从 0 开始计算第一页）
        pageSize: UsersLogic.ADMIN_LIST_PAGE_SIZE, // 一页显示多少天记录
        totalCount: 0, // 总共多少条记录

        ColumnFormatter,

        activeTab: '1',
        listLoading: false,

        updatePwdInfo: { // 修改密码信息
          nickname: undefined,
          id: undefined,
          pwd: undefined,
        },
        updatePwdDialogVisiable: false,
        updatePwdCommitLoading: false,

        columns: {
          id: {
            label: 'ID',
            show: false,
          },
          phone: {
            label: '手机号',
            show: true,
          },
          nickname: {
            label: '昵称',
            show: true,
            disabled: true,
          },
          username: {
            label: '用户名',
            show: true,
          },
          gender: {
            label: '性别',
            show: false,
          },
          age: {
            label: '年龄',
            show: false,
          },
          mail: {
            label: '邮箱',
            show: true,
          },
          description: {
            label: '描述',
            show: true,
          },
          status: {
            label: '状态',
            show: true,
          },
          create_ip: {
            label: '创建 IP',
            show: false,
          },
          create_time: {
            label: '创建时间',
            show: true,
          },
        },
      };
    },
    methods: {
      // 获取管理员账号列表
      getList: function (searchParams) {
        this.listLoading = true;

        UsersLogic.getAdminList(searchParams).then((rs) => {
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
        this.searchParams = Object.assign({}, UsersLogic.ADMIN_LIST_SEARCHPARAMS);
      },

      // 修改密码
      openUpdatePwdDialog: function (info) {
        this.updatePwdInfo.id = info.id;
        this.updatePwdInfo.nickname = info.nickname;
        this.updatePwdDialogVisiable = true;
      },
      updatePwd: function () {
        this.updatePwdCommitLoading = true;
        UsersLogic.updatePwd(this.updatePwdInfo.id, this.updatePwdInfo.pwd).then(rs => {
          if(rs.code === 200) {
            MSG.success('修改成功');
            this.updatePwdDialogVisiable = false;
            // 更新 TOKEN
            OauthLogic.saveLoginData({
              info: {
                ...this.$store.state.userInfo,
                token: rs.token
              },
              token: rs.token
            });
          }else {
            MSG.error(rs.message);
          }

          this.updatePwdCommitLoading = false;
        }).catch(() => {
          this.updatePwdCommitLoading = false;
        });
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
    },
    created: function () {
      this.search();
    }
  }
</script>
