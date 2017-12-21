# 个人网站后台以及前端项目
> 个人网站 => http://blog.lwl.tech
> 后台管理 => http://admin.lwl.tech

## 目录说明
### 后台
```text
├── common          // 公共
├── config          // 配置文件夹
├── db              // 数据库语句
├── l-admin         // 管理后台前端 Vue 项目
├── logs            // 打印日志文件夹
├── middlewares     // 中间件
├── model           // 业务处理
├── node_modules
├── public          // 静态资源
├── routes          // 路由
│   ├── admin       // 管理后台相关路由
│   ├── blog        // 博客端相关路由
├── utils           // 工具
├── views           // 前端页面
├── ADMIN-API.md    // 管理后台接口文档
├── BLOG-API.md     // blog 接口文档
├── redis-db.md     // redis 使用说明
└── pm2-watch.json  // pm2 配置文件 `pm2 start|restart|reload pm2-watch.json`
```

### 管理后台前端
```text
├── build           // webpack
├── config          // webpack config
├── node_modules
├── src
│   ├── assets      // 资源
│   ├── components  // 组件
│   ├── config      // 配置文件
│   ├── logic       // 逻辑处理（接口调用）
│   ├── pages       // 视图界面
│   ├── plugins     // Vue 插件
│   ├── router      // 路由
│   ├── store       // Vuex
│   └── utils       // 工具
└── static          // 资源
    └── editor.md   // markdown 编辑器库
    └── img
```
## 所用技术
### 后台
- `Node.js`
- `Express`
- ...
> 详情请看 `package.json` 文件依赖

### 前端
- `Vue`
- `element-ui`
- ...
> 详情请看 `package.json` 文件依赖

## 命令说明
### 后台
```bash
npm run dev # 开发环境运行
npm run start # 生产环境运行

gulp # ...
```

### 前端
```bash
npm run dev # 开发调试
npm run build # 打包发布
```

## 后台部署环境
1. 配置文件说明
    - 配置文件路径 `./config/*` 。
    - 生产环境配置文件需要手动创建。
    - 复制一份开发环境配置文件然后修改后缀名为 `.prod.js` 即可。
    - 里面配置值根据实际情况填写。
    - 具体逻辑可看 `./config/index.js` 代码。
    - 管理后台配置文件夹 `./l-admin/src/config`
2. 需要环境
    - 缓存 `Redis`。
    - 数据库 `postgresql`。
    - 图片存储使用的是 `七牛云`。

3. 管理员账号说明
    - 管理员账号会在第一次服务器启动时自动生成。
    - 默认账号为 `admin`，密码为 `123456`。
    - 具体可修改 `./model/user.js` 中 `initAdmin()` 方法。


## 后台管理接口文档
> `./ADMIN-API.md` 文件可查看详情