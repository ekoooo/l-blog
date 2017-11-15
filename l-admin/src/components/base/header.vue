<template>
    <header class="header">
        <a href="http://www.lwl.tech" target="_blank" class="header-btn logo fl">
            <img src="static/img/logo_1.png">
        </a>
        <router-link
            :to="{name: 'index'}"
            tag="a"
            class="header-btn br bl fl">
            <span class="index-btn">系统管理后台</span>
        </router-link>
        <a href="javascript: void(0)" class="header-btn bl fr">
            <span class="content">退出</span>
        </a>
        <a href="javascript: void(0)" class="header-btn bl fr">
            <span class="content">一生好吃没钱酒</span>
        </a>
    </header>
</template>