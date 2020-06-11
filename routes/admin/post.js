let express = require('express');
let router = express.Router();
let Filter = require('../../middlewares/filter');
let Sender = require('../../common/sender');
let PostCategory = require('../../model/admin/post_category');
let Post = require('../../model/admin/post');
let PostTag = require('../../model/admin/post_tag');
let PostVote = require('../../model/admin/post_vote');
let Access = require('../../model/admin/access');
let jwt = require('jwt-simple');

// 获取文章列表
router.post('/list', Filter.filtAdminHttpLogin, function (req, res) {
  Sender.send(res, new Post().getPostList(req.body));
});

// 获取一个文章 => /admin/post/?id=<id>
router.get('/', Filter.filtAdminHttpLogin, function (req, res) {
  Sender.send(res, new Post().getPostById(req.query.id));
});

// 添加文章
router.post('/', Filter.filtAdminHttpLogin, function (req, res) {
  // 传入用户 ID
  req.body['userId'] = jwt.decode(req.headers['authorization'], null, true, null)['user_id'];
  Sender.send(res, new Post().addEditPost(req.body));
});

// 编辑文章
router.put('/:id', Filter.filtAdminHttpLogin, function (req, res) {
  // 传入用户 ID
  req.body['userId'] = jwt.decode(req.headers['authorization'], null, true, null)['user_id'];
  Sender.send(res, new Post().addEditPost(req.body, req['params']['id']));
});

// 发布文章
router.put('/publish/:id', Filter.filtAdminHttpLogin, function (req, res) {
  Sender.send(res, new Post().updateStatus(req['params']['id'], 1));
});

// 撤回文章
router.put('/unpublish/:id', Filter.filtAdminHttpLogin, function (req, res) {
  Sender.send(res, new Post().updateStatus(req['params']['id'], 0));
});

// 删除文章
router.delete('/:id', Filter.filtAdminHttpLogin, function (req, res) {
  Sender.send(res, new Post().updateStatus(req['params']['id'], -1));
});

// 获取文章分类
router.post('/category/list', Filter.filtAdminHttpLogin, function (req, res) {
  Sender.send(res, new PostCategory().getPostCategory(req.body));
});

// 获取文章分类下拉数据
router.get('/category', Filter.filtAdminHttpLogin, function (req, res) {
  Sender.send(res, new PostCategory().getPostCategorySelector());
});

// 添加文章分类
router.post('/category', Filter.filtAdminHttpLogin, function (req, res) {
  Sender.send(res, new PostCategory().addPostCategory(req.body));
});

// 编辑文章分类
router.put('/category/:id', Filter.filtAdminHttpLogin, function (req, res) {
  Sender.send(res, new PostCategory().editPostCategory(req['params']['id'], req.body));
});

// 删除文章分类
router.delete('/category/:id', Filter.filtAdminHttpLogin, function (req, res) {
  Sender.send(res, new PostCategory().delPostCategoryById(req['params']['id']));
});

// 获取文章标签下拉数据
router.get('/tag', Filter.filtAdminHttpLogin, function (req, res) {
  Sender.send(res, new PostTag().getTagSelector());
});

// 获取文章下拉数据
router.get('/all', Filter.filtAdminHttpLogin, function (req, res) {
  Sender.send(res, new Post().getPostSelectorData());
});

// 投票列表
router.post('/vote/list', Filter.filtAdminHttpLogin, function (req, res) {
  Sender.send(res, new PostVote().getVoteList(req.body));
});

// 文章访问记录
router.post('/access/list', Filter.filtAdminHttpLogin, function (req, res) {
  Sender.send(res, new Access().getPostAccessList(req.body));
});

// 文章访问记录统计
router.post('/access/chart', Filter.filtAdminHttpLogin, function (req, res) {
  Sender.send(res, new Access().getPostAccessChartData(req.body));
});

module.exports = router;