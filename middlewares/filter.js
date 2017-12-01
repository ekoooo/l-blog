const CODE = require('../common/code');
let Logger = require('../common/logger');

let OauthLogic = require('../logic/oauth_logic');

module.exports = {
    /**
     * 调用接口判断是否登录
     */
    filtAdminHttpLogin(req, res, next) {
        OauthLogic.isLogin(req.headers['authorization']).then(rs => {
            if(rs['is_admin'] !== 1) {
                res.send({
                    code: CODE.UNAUTHORIZED,
                    message: '无权访问',
                });
            }else {
                next();
            }
        }).catch(err => {
            res.send({
                code: CODE.UNAUTHORIZED,
                message: '登录失效',
            });
        });
    },
}