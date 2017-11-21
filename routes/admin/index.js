var express = require('express');
var router = express.Router();
var Logger = require('../../common/logger');
var OauthLogic = require('../../logic/admin/oauth_logic');

// 登录
router.post('/login', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    OauthLogic.validAdmin(username, password).then(rs => {
        res.send(rs);
    }).catch(error => {
        res.send(error);
    });
});

module.exports = router;