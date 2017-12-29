let express = require('express');
let router = express.Router();
let Sender = require('../../common/sender');
let Filter = require('../../middlewares/filter');
let Comment = require('../../model/admin/comment');

// 获取评论列表
router.post('/list', Filter.filtAdminHttpLogin, function (req, res) {
    Sender.send(res, new Comment().getCommentList(req.body));
});

// 获取一个评论的信息
router.get('/:id', Filter.filtAdminHttpLogin, function (req, res) {
    Sender.send(res, new Comment().getCommentById(req['params']['id']));
});

// 通过审核、删除、恢复
router.post('/post/:id/status/:status', Filter.filtAdminHttpLogin, function (req, res) {
    Sender.send(res, new Comment().updateStatus(req['params']['id'], req['params']['status']));
});

module.exports = router;