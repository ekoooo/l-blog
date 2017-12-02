let express = require('express');
let router = express.Router();
let Filter = require('../../middlewares/filter');
let PostCategoryLogic = require('../../logic/admin/post_category_logic');
let Misc = require('../../utils/misc');

/**
 * 添加文章分类
 */
router.post('/category', Filter.filtAdminHttpLogin, function (req, res) {
    Misc.send(res, PostCategoryLogic.addPostCategory(req.body));
});

/**
 * 获取文章分类
 */
router.post('/category/list', Filter.filtAdminHttpLogin, function (req, res) {
    Misc.send(res, PostCategoryLogic.getPostCategory(req.body));
});

module.exports = router;