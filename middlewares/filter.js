const CODE = require('../common/code');
let Logger = require('../common/logger');

let Auth = require('../model/admin/auth');

module.exports = {
    /**
     * 调用接口判断是否登录
     */
    filtAdminHttpLogin(req, res, next) {
        Auth.isLogin(req.headers['authorization']).then(rs => {
            if(rs['is_admin'] !== 1) {
                Logger.info('unauthorized access =>', `user id => ${ rs['user_id'] }`);
                
                res.send({
                    code: CODE.UNAUTHORIZED,
                    message: '无权访问',
                });
            }else {
                next();
            }
        }).catch(() => {
            Logger.info('logon expires ip =>', req.ip);
            
            res.send({
                code: CODE.UNAUTHORIZED,
                message: '登录失效',
            });
        });
    },
};