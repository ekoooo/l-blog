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
```json
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
            {
                "key": "music.mp3",
                "hash": "lkUi5M3KGjKRHGBbTdfoBWPayVG1",
                "fsize": 5955259,
                "mimeType": "audio/mp3",
                "putTime": 15121140127886448,
                "type": 0,
                "status": 0
            }
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
```json
{
    "code": 200,
    "list": [
        {
            "id": 1,
            "name": "HTML",
            "create_time": "2017-12-04T01:28:40.041Z",
            "status": 1
        },
        {
            "id": 2,
            "name": "JavaScript",
            "create_time": "2017-12-04T01:28:48.434Z",
            "status": 1
        },
        {
            "id": 3,
            "name": "Node",
            "create_time": "2017-12-04T01:28:57.898Z",
            "status": 1
        },
        {
            "id": 4,
            "name": "Vue",
            "create_time": "2017-12-04T01:29:08.487Z",
            "status": 1
        },
        {
            "id": 5,
            "name": "element ui",
            "create_time": "2017-12-04T01:29:20.423Z",
            "status": 1
        }
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