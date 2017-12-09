let express = require('express');
let router = express.Router();
let Filter = require('../../middlewares/filter');
let Misc = require('../../utils/misc');
let PostCategory = require('../../model/admin/post_category');
let Post = require('../../model/admin/post');
let PostTag = require('../../model/admin/post_tag');
let jwt = require('jwt-simple');

/**
 * 添加文章
 */
router.post('/', Filter.filtAdminHttpLogin, function (req, res) {
    // 传入用户 ID
    req.body['userId'] = jwt.decode(req.headers['authorization'], null, true, null)['user_id'];
    Misc.send(res, new Post().addEditPost(req.body));
});
// 编辑文章
router.put('/:id', Filter.filtAdminHttpLogin, function (req, res) {
    // 传入用户 ID
    req.body['userId'] = jwt.decode(req.headers['authorization'], null, true, null)['user_id'];
    Misc.send(res, new Post().addEditPost(req.body, req['params']['id']));
});

/**
 * 获取文章列表
 */
router.post('/list', Filter.filtAdminHttpLogin, function (req, res) {
    Misc.send(res, new Post().getPostList(req.body));
});

/**
 * 获取一个文章
 * /admin/post/?id=<id>
 */
router.get('/', Filter.filtAdminHttpLogin, function (req, res) {
    Misc.send(res, new Post().getPostById(req.query.id));
});

/**
 * 获取文章分类
 */
router.post('/category/list', Filter.filtAdminHttpLogin, function (req, res) {
    Misc.send(res, new PostCategory().getPostCategory(req.body));
});

/**
 * 获取文章分类下拉数据
 */
router.get('/category', Filter.filtAdminHttpLogin, function (req, res) {
    Misc.send(res, new PostCategory().getPostCategorySelector());
});

/**
 * 获取文章标签下拉数据
 */
router.get('/tag', Filter.filtAdminHttpLogin, function (req, res) {
    Misc.send(res, new PostTag().getTagSelector());
});

/**
 * 添加文章分类
 */
router.post('/category', Filter.filtAdminHttpLogin, function (req, res) {
    Misc.send(res, new PostCategory().addPostCategory(req.body));
});

/**
 * 添加文章分类
 */
router.put('/category/:id', Filter.filtAdminHttpLogin, function (req, res) {
    Misc.send(res, new PostCategory().editPostCategory(req['params']['id'], req.body));
});

/**
 * 删除文章分类
 */
router.delete('/category/:id', Filter.filtAdminHttpLogin, function (req, res) {
    Misc.send(res, new PostCategory().delPostCategoryById(req['params']['id']));
});

module.exports = router;