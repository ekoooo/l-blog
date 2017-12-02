let express = require('express');
let router = express.Router();
let Filter = require('../../middlewares/filter');
let Misc = require('../../utils/misc');
let PostCategory = require('../../model/admin/post_category');

/**
 * 添加文章分类
 */
router.post('/category', Filter.filtAdminHttpLogin, function (req, res) {
    Misc.send(res, new PostCategory().addPostCategory(req.body));
});

/**
 * 获取文章分类
 */
router.post('/category/list', Filter.filtAdminHttpLogin, function (req, res) {
    Misc.send(res, new PostCategory().getPostCategory(req.body));
});

module.exports = router;