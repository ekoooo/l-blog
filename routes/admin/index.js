var express = require('express');
var router = express.Router();
var Logger = require('../../common/logger');
var OauthLogic = require('../../logic/oauth_logic');
var Filter = require('../../middlewares/filter');

router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Content-Type", "application/json;charset=utf-8");
    
    next();
});

// 登录
router.post('/login', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    OauthLogic.loginAdmin(username, password).then(rs => {
        res.send(rs);
    }).catch(error => {
        res.send(error);
    });
});

module.exports = router;