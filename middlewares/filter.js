const CODE = require('../common/code');
let Logger = require('../common/logger');

let OauthLogic = require('../logic/oauth_logic');

module.exports = {
    /**
     * 调用接口判断是否登录
     */
    filtHttpLogin(req, res, next) {
        OauthLogic.isLogin(req.headers['authorization']).then(rs => {
            next();
        }).catch(err => {
            res.send({
                code: CODE.UNAUTHORIZED,
                message: '登录失效',
            });
        });
    },
}