let express = require('express');
let router = express.Router();
let Logger = require('../../common/logger');
let OauthLogic = require('../../logic/oauth_logic');
let Filter = require('../../middlewares/filter');
let Misc = require('../../utils/misc');

// 登录
router.post('/login', function (req, res, next) {
    let username = req.body.username;
    let password = req.body.password;

    Misc.send(res, OauthLogic.loginAdmin(username, password))
});

// 退出
router.post('/logout', Filter.filtAdminHttpLogin, function (req, res, next) {
    Misc.send(res, OauthLogic.logout(req.headers.authorization));
});

module.exports = router;