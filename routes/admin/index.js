let express = require('express');
let router = express.Router();
let Misc = require('../../utils/misc');
let Filter = require('../../middlewares/filter');
let Auth = require('../../model/auth');

// 登录
router.post('/login', (req, res) => {
    Misc.send(res, new Auth().loginAdmin(req.body.username, req.body.password));
});

// 退出
router.post('/logout', Filter.filtAdminHttpLogin, function (req, res) {
    Misc.send(res, new Auth().logout(req.headers['authorization']));
});

module.exports = router;