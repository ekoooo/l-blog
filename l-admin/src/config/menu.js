// 菜单配置
const config = [
    {
        path: '/main/index',
        text: '主页',
        icon: 'fa-flag'
    },
    {
        text: '内容管理',
        icon: 'fa-book',
        index: '1',
        item: [
            {
                path: '/main/posts',
                text: '文章列表',
                icon: 'fa-pencil'
            },
            {
                path: '/main/postCategory',
                text: '文章分类',
                icon: 'fa-anchor'
            },
            {
                path: '/main/comments',
                text: '评论列表',
                icon: 'fa-comments-o'
            },
            {
                path: '/main/postVote',
                text: '文章投票',
                icon: 'fa-heart'
            },
        ]
    },
    {
        text: '素材管理',
        icon: 'fa-files-o',
        index: '2',
        item: [
            {
                path: '/main/images',
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
                path: '/main/configs',
                text: '基础配置',
                icon: 'fa-cog'
            },
            {
                path: '/main/account',
                text: '账号管理',
                icon: 'fa-user'
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