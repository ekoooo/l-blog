let express = require('express');
let router = express.Router();
let Logger = require('../../common/logger');
let OauthLogic = require('../../logic/oauth_logic');
let Filter = require('../../middlewares/filter');

router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Content-Type", "application/json;charset=utf-8");
    
    next();
});

// 登录
router.post('/login', function (req, res, next) {
    let username = req.body.username;
    let password = req.body.password;

    OauthLogic.loginAdmin(username, password).then(rs => {
        res.send(rs);
    }).catch(error => {
        res.send(error);
    });
});

module.exports = router;