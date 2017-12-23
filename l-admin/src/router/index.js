import Vue from 'vue';
import Router from 'vue-router';
import MSG from '../utils/message';
import OauthLogic from '../logic/oauth';
import InfoConfig from '../config/info';

Vue.use(Router);

const router = new Router({
    mode: 'hash',
    routes: [
        {
            path: '/',
            redirect: { name: 'index' },
        },
        {
            path: '/main',
            component: () => import('../pages/main'),
            children: [
                {
                    path: 'index',
                    name: 'index',
                    component: () => import('../pages/index'),
                    meta: {
                        title: '主页',
                        auth: true,
                    }
                },
                {
                    path: 'posts',
                    name: 'posts',
                    component: () => import('../pages/posts'),
                    meta: {
                        title: '文章列表',
                        auth: true,
                    }
                },
                {
                    path: 'post/add',
                    name: 'postAdd',
                    component: () => import('../pages/post_add_edit'),
                    meta: {
                        title: '文章添加',
                        auth: true,
                    }
                },
                {
                    path: 'post/edit/:id',
                    name: 'postEdit',
                    component: () => import('../pages/post_add_edit'),
                    meta: {
                        title: '文章编辑',
                        auth: true,
                    }
                },
                {
                    path: 'postCategory',
                    name: 'postCategory',
                    component: () => import('../pages/post_category'),
                    meta: {
                        title: '文章分类',
                        auth: true,
                    }
                },
                {
                    path: 'postVote',
                    name: 'postVote',
                    component: () => import('../pages/post_vote'),
                    meta: {
                        title: '文章投票',
                        auth: true,
                    }
                },
                {
                    path: 'postAccess',
                    name: 'postAccess',
                    component: () => import('../pages/post_access'),
                    meta: {
                        title: '文章访问',
                        auth: true,
                    }
                },
                {
                    path: 'images',
                    name: 'images',
                    component: () => import('../pages/images'),
                    meta: {
                        title: '图片管理',
                        auth: true,
                    }
                },
                {
                    path: 'configs',
                    name: 'configs',
                    component: () => import('../pages/configs'),
                    meta: {
                        title: '基础设置',
                        auth: true,
                    }
                },
                {
                    path: 'account',
                    name: 'account',
                    component: () => import('../pages/account'),
                    meta: {
                        title: '账号管理',
                        auth: true,
                    }
                },
                {
                    path: 'comments',
                    name: 'comments',
                    component: () => import('../pages/comments'),
                    meta: {
                        title: '评论列表',
                        auth: true,
                    }
                },
            ],
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('../pages/login'),
            meta: {
                title: '登录',
                auth: false,
            }
        },
        {
            path: '*',
            name: 'notFound',
            component: () => import('../pages/not_found.vue'),
            meta: {
                title: '404',
                auth: false
            }
        }
    ]
});

router.beforeEach((to, from, next) => {
    // 设置 标题
    document.title = `${ InfoConfig.title } - ${ to.meta.title || ''}`;
    
    // 登录权限验证
    if(to.meta.auth && !OauthLogic.isLogin()) {
        MSG.error('闯红灯，请登陆！');
        router.replace({name: 'login'});
        return;
    }
    
    next();
});

router.afterEach(route => {

});

export default router;