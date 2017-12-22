let express = require('express');
let router = express.Router();
let Sender = require('../../common/sender');
let Filter = require('../../middlewares/filter');
let Auth = require('../../model/admin/auth');

// 登录
router.post('/login', (req, res) => {
    Sender.send(res, new Auth().loginAdmin(req.body.username, req.body.password));
});

// 退出
router.post('/logout', Filter.filtAdminHttpLogin, function (req, res) {
    Sender.send(res, new Auth().logout(req.headers['authorization']));
});

module.exports = router;