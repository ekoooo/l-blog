let express = require('express');
let router = express.Router();
let Post = require('../../model/blog/post');
let Common = require('../../model/blog/common');
let Comment = require('../../model/blog/comment');
let Sender = require('../../common/sender');

// 首页文章列表
router.get('/', function (req, res, next) {
  Sender.sendIndexPage(res, next, new Post().getPostList(req['query']['page'] || 0));
});

// sidebar 信息
router.get('/sidebar', function (req, res) {
  Sender.send(res, new Common().getSidebarInfo())
});

// 留言
router.post('/comment', function (req, res) {
  Sender.send(res, new Comment().addComment(req.body, req.ip));
});

// 获取留言列表 /comment?postId=<postId>&page=<pageId>
router.get('/comment', function (req, res) {
  Sender.send(res, new Comment().getCommentList(req['query']['postId'], req['query']['page']));
});

// 自用
router.get(['/love', '/view', '/leave', '/join'], function (req, res) {
  Sender.sendMe(req, res, req.originalUrl.replace('/', ''));
});

module.exports = router;