let express = require('express');
let router = express.Router();
let Filter = require('../../middlewares/filter');
let Sender = require('../../common/sender');
let User = require('../../model/admin/user');

// 获取文章列表
router.post('/', Filter.filtAdminHttpLogin, function (req, res) {
    Sender.send(res, new User().getUserList(req.body, req['query']['admin']));
});

// 修改密码
router.put('/pwd/:id', Filter.filtAdminHttpLogin, function (req, res) {
    Sender.send(res, new User().updatePwd(req['params']['id'], req.body.pwd));
});

module.exports = router;