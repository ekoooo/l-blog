<template>
    <header class="header">
        <a :href="InfoConfig.blogUrl" target="_blank" class="header-btn logo fl">
            <img src="static/img/logo_1.png">
        </a>
        <router-link
            :to="{name: 'index'}"
            tag="a"
            class="header-btn br bl fl">
            <span class="index-btn">后台系统管理</span>
        </router-link>
        <a @click="OauthLogic.logout()" href="javascript: void(0)" class="header-btn bl fr">
            <span class="content">退出</span>
        </a>
        <a href="javascript: void(0)" class="header-btn bl fr">
            <span class="content">{{ $store.state.userInfo.nickname }}</span>
        </a>
    </header>
</template>

<script>
    import InfoConfig from '../../config/info';
    import OauthLogic from '../../logic/oauth';

    export default {
        data: function() {
            return {
                InfoConfig,
                OauthLogic,
            };
        },
    };
</script>