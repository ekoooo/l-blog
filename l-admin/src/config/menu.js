// 菜单配置
const config = [
    {
        path: '/',
        text: '主页',
        icon: 'fa-flag'
    },
    {
        text: '内容管理',
        icon: 'fa-book',
        index: '1',
        item: [
            {
                path: '/posts',
                text: '文章列表',
                icon: 'fa-pencil'
            },
            {
                path: '/postCategory',
                text: '文章分类',
                icon: 'fa-anchor'
            },
            {
                path: '/comments',
                text: '评论列表',
                icon: 'fa-comments-o'
            },
        ]
    },
    {
        text: '素材管理',
        icon: 'fa-files-o',
        index: '2',
        item: [
            {
                path: '/images',
                text: '图片管理',
                icon: 'fa-file-image-o'
            },
        ]
    },
    {
        text: '系统管理',
        icon: 'fa-cogs',
        index: '3',
        item: [
            {
                path: '/configs',
                text: '基础配置',
                icon: 'fa-cog'
            },
        ]
    },
    {
        path: '/login',
        text: '退出登录',
        icon: 'fa-sign-out'
    }
];

export default config;