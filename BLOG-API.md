
## Sidebar 信息
请求语法
```text
GET /sidebar
Content-Type: application/json
```
请求体
```
```
成功响应
```
{
    "code": 200,
    "info": {
        "post_num": 2,
        "post_category_num": 3,
        "post_tag_num": 4,
        "en_name": "liuwanlin",
        "ch_name": "刘万林",
        "links": [
            {
                "label": "Github",
                "href": "https://github.com/ekoooo"
            },
            // ...
        ],
        "friends_links": [
            {
                "label": "Baidu",
                "href": "https://www.baidu.com/"
            },
            // ...
        ]
    }
}
```