<template>
  <div class="login-box">
    <div class="wrapper">
      <a :href="InfoConfig.blogUrl" class="logo">
        <img src="static/img/logo.gif">
      </a>
      <h3 class="title">后台管理系统</h3>
      <el-input
        :maxlength="9"
        class="ipt"
        size="small"
        placeholder="请输入用户名"
        v-model="formInfo.username">
        <span slot="append" class="icon">
          <i class="fa fa-user" aria-hidden="true"></i>
        </span>
      </el-input>
      <el-input
        :maxlength="16"
        @keyup.enter.native="login"
        class="ipt"
        size="small"
        type="password"
        placeholder="请输入密码"
        v-model="formInfo.password">
        <span slot="append" class="icon">
          <i class="fa fa-unlock-alt" aria-hidden="true"></i>
        </span>
      </el-input>
      <el-button
        :loading="loginLoading"
        @click="login"
        class="btn"
        size="small"
        type="primary"
        plain>骄傲登录</el-button>
    </div>
  </div>
</template>

<script>
  import InfoConfig from '../config/info';
  import OauthLogic from '../logic/oauth';
  import MSG from '../utils/message';

  export default {
    data: function() {
      return {
        formInfo: {
          username: '',
          password: '',
        },
        loginLoading: false,
        InfoConfig,
      };
    },
    methods: {
      /**
       * 验证登录参数
       */
      validLogin: function() {
        if(this.formInfo.username.length < 3
            || this.formInfo.username.length > 9) {
          MSG.error('账号长度应3至9位！');
          return false;
        }
        else if(this.formInfo.password.length < 6
            || this.formInfo.password.length > 16) {
          MSG.error('密码长度应6至16位！');
          return false;
        }
        return true;
      },
      login: function() {
        if(!this.validLogin()) { return; }

        this.loginLoading = true;

        OauthLogic.loginAdmin(this.formInfo).then(data => {
          if(data.code === 200) {
            MSG.success('登陆成功！');
            this.$router.replace({ name: 'index' });
          }else {
            this.loginLoading = false;
            MSG.error(data.message);
          }
        }).catch(err => {
          this.loginLoading = false;
        });
      }
    },
    created: function() {
      // 进入登录页，自动清除登录信息
      OauthLogic.clearLoginData();
    },
  }
</script>

<style lang="scss" scoped>
  .login-box {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: #293038;
    color: #eee;
    top: 0;
    left: 0;
    overflow: hidden;

    .wrapper {
      position: relative;
      margin: 150px auto;
      border-radius: 4px;
      width: 300px;
      padding: 20px;
      text-align: center;
      background-color: #42485B;
    }

    .title {
      margin: 0;
      text-align: center;
      font-size: 16px;
      padding-top: 20px;
      padding-bottom: 25px;
    }

    .logo {
      display: inline-block;
      background-color: #fff;
      padding: 6px;
      border-radius: 50px;

      img {
        width: 50px;
        height: 50px;
      }
    }

    .icon {
      display: block;
      width: 15px;
      text-align: center;
      font-size: 14px;
    }

    .ipt {
      margin-bottom: 14px;
    }

    .btn {
      width: 100%;
      margin-bottom: 10px;
    }
  }
</style>
