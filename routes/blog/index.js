let express = require('express');
let router = express.Router();
let Post = require('../../model/blog/post');
let Common = require('../../model/blog/common');
let Sender = require('../../common/sender');

// 首页文章列表
router.get('/', function (req, res, next) {
    Sender.sendIndexPage(res, next, new Post().getPostList(req['query']['page'] || 0));
});

// sidebar 信息
router.get('/sidebar', function (req, res) {
    Sender.send(res, new Common().getSidebarInfo())
});

module.exports = router;