# 后台管理接口
错误统一响应结构
```
{
    "code": 12345, // 错误代码
    "message": "error message", // 错误消息
}
```

## 登录
请求语法
```text
POST /admin/login
Content-Type: application/json
```
请求体
```
{
    "username": "username", // 用户名
    "password": "password", // 密码
}
```
成功响应
```json
{
    "code": 200,
    "message": "验证成功！",
    "info": {
        "user_id": 1,
        "username": "admin",
        "avatar_url": null,
        "status": 1,
        "is_admin": 1,
        "create_time": "2017-11-20T09:26:28.441Z",
        "create_ip": null,
        "gender": 1,
        "age": 24,
        "phone": "15727781885",
        "mail": "954408050@qq.com",
        "description": "管理员账号"
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjozNCwidXNlcm5hbWUiOiJsd2wiLCJpc19hZG1pbiI6MSwiaXNzIjoibGl1d2FubGluIiwiaWF0IjoxNTEyMTEwMzA2NDkyfQ.FYAbQXdUdGvRMycBF6Z_msX-w9prjUo2DwH_02TpNxU"
}
```

## 退出
请求语法
```text
POST /admin/logout
Content-Type: application/json
Authorization: <Token>
```
请求体
```json

```
成功响应
```json
{
    "code": 200,
    "message": "退出成功！"
}
```

## 图片列表
请求语法
```text
GET /admin/qiniu/files?size=<pagesize>&mark=<nextMarker>
Content-Type: application/json
Authorization: <Token>
```
> `pagesize` 一页显示几条记录，`nextMarker` 下一页标志

请求体
```json
```
成功响应
```
{
    "code": 200,
    "info": {
        "items": [
            {
                "key": "8487758448826_1512241551167.gif",
                "hash": "FhUfbHdtbi_pVQ2YT01-0Fwm5bnT",
                "fsize": 32796,
                "mimeType": "image/gif",
                "putTime": 15122415676145848,
                "type": 0,
                "status": 0
            },
            ...
        ]
    }
}
```

## 删除单个文件/图片
请求语法
```text
DELETE /admin/qiniu/:key
Content-Type: application/json
Authorization: <Token>
```
> `key` 七牛云文件 key

请求体
```json
```
成功响应
```json
{
    "code": 200,
    "info": null
}
```

## `Upload Token`
请求语法
```text
GET /admin/qiniu/uploadToken
Content-Type: application/json
Authorization: <Token>
```
请求体
```json
```
成功响应
```json
{
    "code": 200,
    "info": "6vssbdrJhHTG5sL3QpCphclVxrASGmuRDiXkjFmW:JqqjHWX6ZW4pHkWXMogk4SykOkM=:eyJzY29wZSI6ImltYWdlIiwiZGVhZGxpbmUiOjE1MTIzNzEyNjV9"
}
```

## 文章分类列表
请求语法
```
POST /admin/post/category/list
Content-Type: application/json
Authorization: <Token>
```
请求体
```
{
    "pageId": 0, // 第一页，从 0 开始
    "pageSize": 10, // 一页几条记录
    "q": { // 搜索参数
        "postCategoryName": "xx", // 分类名称
    }
}
```
成功响应
```
{
    "code": 200,
    "list": [
        {
            "id": 1,
            "name": "HTML",
            "create_time": "2017-12-04T01:28:40.041Z",
            "status": 1
        },
        ...
    ],
    "pageId": 0,
    "pageSize": 12,
    "totalCount": 5
}
```

## 添加文章分类
请求语法
```
POST /admin/post/category
Content-Type: application/json
Authorization: <Token>
```
请求体
```
{
    "postCategoryName": "test", // 分类名称
}
```
成功响应
```
{
    "code": 200,
    "info": 6 // ID
}
```

## 删除文章分类
请求语法
```
DELETE /admin/post/category/:id
Content-Type: application/json
Authorization: <Token>
```
> `id` 文章分类 id

请求体
```json
{
    "postCategoryId": 123
}
```
成功响应
```
{
    "code": 200,
    "info": 123, // 删除成功的ID
}
```

## 编辑文章分类
请求语法
```
PUT /admin/post/category/:id
Content-Type: application/json
Authorization: <Token>
```
> `id` 文章分类 id

请求体
```json
{
    "postCategoryName": "TEST"
}
```
成功响应
```
{
    "code": 200,
    "info": 123, // 编辑成功的ID
}
```

## 获取分类下拉数据
请求语法
```
GET /admin/post/category
Content-Type: application/json
Authorization: <Token>
```
请求体
```json
```
成功响应
```
{
    "code": 200,
    "info": [
        {
            "id": 21,
            "name": "React Native"
        },
        ...
    ]
}
```

## 获取标签下拉数据
请求语法
```
GET /admin/post/tag
Content-Type: application/json
Authorization: <Token>
```
请求体
```json
```
成功响应
```
{
    "code": 200,
    "info": [
        {
            "name": "html"
        },
        ...
    ]
}
```

## 添加文章
请求语法
```
POST /admin/post
Content-Type: application/json
Authorization: <Token>
```
请求体
```
{
    title: undefined, // 标题
    categoryId: undefined, // 分类
    tags: [], // 标签
    markdown: undefined, // 内容 markdown
    html: undefined, // 内容 html
    text: undefined, // 内容 text
    desc: undefined, // 简述 html
    descMarkdown: undefined, // 简述 markdown
    descText: undefined, // 简述 text
    commentCheck: false, // 评论是否需审核
    keyWords: undefined, // 关键字
}
```
成功响应
```json
{
    "code": 200,
    "info": 123
}
```

## 编辑文章
请求语法
```
PUT /admin/post/<id>
Content-Type: application/json
Authorization: <Token>
```
请求体
```
{
    title: undefined, // 标题
    categoryId: undefined, // 分类
    tags: [], // 标签
    markdown: undefined, // 内容 markdown
    html: undefined, // 内容 html
    text: undefined, // 内容 text
    desc: undefined, // 简述 html
    descMarkdown: undefined, // 简述 markdown
    descText: undefined, // 简述 text
    commentCheck: false, // 评论是否需审核
    keyWords: undefined, // 关键字
}
```
成功响应
```json
{
    "code": 200,
    "info": 123
}
```

## 删除文章
请求语法
```
DELETE /admin/post/<id>
Content-Type: application/json
Authorization: <Token>
```
请求体
```

```
成功响应
```json
{
    "code": 200,
    "info": 123
}
```

## 发布文章
请求语法
```
PUT /admin/post/publish/<id>
Content-Type: application/json
Authorization: <Token>
```
请求体
```

```
成功响应
```json
{
    "code": 200,
    "info": 123
}
```

## 撤回文章
请求语法
```
PUT /admin/post/unpublish/<id>
Content-Type: application/json
Authorization: <Token>
```
请求体
```

```
成功响应
```json
{
    "code": 200,
    "info": 123
}
```

## 获取文章列表
请求语法
```
GET /admin/post/list
Content-Type: application/json
Authorization: <Token>
```
请求体
```
{
    "pageId": 0,
    "pageSize": 10,
    "q": {
        title: undefined, // 标题
        categoryName: undefined, // 分类名
        categoryId: undefined, // 分类ID
        keyWords: undefined, // 关键字
        tag: undefined, // 标签
        text: undefined, // 内容
    }
}
```
成功响应
```
{
    "code": 200,
    "info": [
        {
            "id": 1,
            "title": "CentOS 6.8 安装 ngnix",
            "key_words": "ngnix,安装,centos",
            "link_count": 0,
            "access_count": 0,
            "comment_check": 0,
            "create_time": "2017-12-08T15:46:12.546Z",
            "username": "admin",
            "category_name": "Linux",
            "tags": "ngnix,linxu,CentOS,CentOS 6.8",
            "status": 1
        },
        ...
    ],
    "pageId": 0,
    "pageSize": 10,
    "totalCount": 1
}
```

## 获取单个文章
请求语法
```
GET /admin/post/?id=<id>
Content-Type: application/json
Authorization: <Token>
```
请求体
```

```
成功响应
```
{
    "code": 200,
    "info": {
        "title": "标题",
        "categoryId": ?, // 分类 ID
        "markdown": "",
        "html": "",
        "text": "",
        "descMarkdown": "",
        "commentCheck": false,
        "keyWords": "",
        "tags": [
            "tag",
            ...
        ]
    }
}
```

## 文章投票列表
请求语法
```
POST /admin/post/vote/list
Content-Type: application/json
Authorization: <Token>
```
请求体
```
{
    "pageId": 0,
    "pageSize": 10,
    "q": {
        title: undefined, // 文章标题
        type: undefined, // Like/Unlike
    }
}
```
响应体
```
    "code": 200,
    "info": [
        {
            //...
        },
        ...
    ],
    "pageId": 0,
    "pageSize": 10,
    "totalCount": 1
```

## 管理员列表
请求语法
```
POST /admin/user?admin=1
Content-Type: application/json
Authorization: <Token>
```
请求体
```
{
    "pageId": 0,
    "pageSize": 10,
    "q": {
        username: undefined,
        nickname: undefined,
    }
}
```
响应体
```
    "code": 200,
    "info": [
        {
            //...
        },
        ...
    ],
    "pageId": 0,
    "pageSize": 10,
    "totalCount": 1
```

## 文章访问记录
请求语法
```
POST /admin/post/access/list
Content-Type: application/json
Authorization: <Token>
```
请求体
```
{
    "pageId": 0,
    "pageSize": 10,
    "q": {
        title: undefined, // 文章标题
    }
}
```
响应体
```
    "code": 200,
    "info": [
        {
            //...
        },
        ...
    ],
    "pageId": 0,
    "pageSize": 10,
    "totalCount": 1
```