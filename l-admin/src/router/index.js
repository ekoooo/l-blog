import Vue from 'vue';
import Router from 'vue-router';
import MSG from '../utils/message';
import InfoConfig from '../config/info';

Vue.use(Router);

const router = new Router({
    mode: 'hash',
    routes: [
        {
            path: '/',
            name: 'index',
            component: () => import('../pages/index'),
            meta: {
                title: '主页',
                auth: true,
            }
        },
        {
            path: '/postCategory',
            name: 'postCategory',
            component: () => import('../pages/post_category'),
            meta: {
                title: '文章分类',
                auth: true,
            }
        },
        {
            path: '/posts',
            name: 'posts',
            component: () => import('../pages/posts'),
            meta: {
                title: '文章列表',
                auth: true,
            }
        },
        {
            path: '/images',
            name: 'images',
            component: () => import('../pages/images'),
            meta: {
                title: '图片管理',
                auth: true,
            }
        },
        {
            path: '/configs',
            name: 'configs',
            component: () => import('../pages/configs'),
            meta: {
                title: '基础设置',
                auth: true,
            }
        },
        {
            path: '/comments',
            name: 'comments',
            component: () => import('../pages/comments'),
            meta: {
                title: '评论列表',
                auth: true,
            }
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
    next();
});

router.afterEach(route => {

});

export default router;